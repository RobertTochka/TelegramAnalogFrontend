import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { api } from '@/api/api'

import { Message, MessageFilter, PaginatedResponse } from '@/types'

export const useGetMessages = (
  chatId: string,
  filters: Omit<MessageFilter, 'cursor'> = {}
) => {
  const queryKey = ['messages', 'list', chatId, JSON.stringify(filters)]
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isFetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })

      if (pageParam) {
        params.set('cursor', pageParam)
      }

      const { data } = await api.get<PaginatedResponse<Message[]>>(
        `/messages/${chatId}`,
        { params }
      )

      return data
    },
    getNextPageParam: lastPage => {
      return lastPage.meta.nextCursor
    },
    initialPageParam: null,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!chatId
  })

  const messages = useMemo(() => {
    if (!data) return []

    const map = new Map()

    for (const page of data.pages) {
      for (const msg of page.data) {
        map.set(msg.id, msg)
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    )
  }, [data])

  const safeDefaultMeta = (limit = 40) => ({
    total: 1,
    limit,
    nextCursor: null,
    hasNextPage: false
  })

  const updateMessageInCache = useCallback(
    (chatId: string, messageId: string, updates: Partial<Message>) => {
      queryClient.setQueriesData(
        {
          predicate: query => {
            const k = query.queryKey
            return (
              Array.isArray(k) &&
              k.length >= 3 &&
              k[0] === 'messages' &&
              k[1] === 'list' &&
              k[2] === chatId
            )
          }
        },
        (oldData: any) => {
          if (!oldData) return oldData

          const pages = Array.isArray(oldData.pages) ? oldData.pages : []
          if (pages.length === 0) return oldData

          const newPages = pages.map((page: PaginatedResponse<Message[]>) => {
            const data = Array.isArray(page.data) ? page.data : []
            return {
              ...page,
              data: data.map((m: Message) =>
                m.id === messageId ? { ...m, ...updates } : m
              )
            }
          })

          return {
            ...oldData,
            pages: newPages
          }
        }
      )
    },
    [queryClient]
  )

  const removeMessageFromCache = useCallback(
    (chatId: string, messageId: string) => {
      queryClient.setQueriesData(
        {
          predicate: query => {
            const k = query.queryKey
            return (
              Array.isArray(k) &&
              k.length >= 3 &&
              k[0] === 'messages' &&
              k[1] === 'list' &&
              k[2] === chatId
            )
          }
        },
        (oldData: any) => {
          if (!oldData) return oldData

          const pages = Array.isArray(oldData.pages) ? oldData.pages : []
          if (pages.length === 0) return oldData

          const newPages = pages.map((page: PaginatedResponse<Message[]>) => {
            const data = Array.isArray(page.data) ? page.data : []
            const had = data.some((m: Message) => m.id === messageId)
            const newData = data.filter((m: Message) => m.id !== messageId)

            const prevTotal =
              typeof page.meta?.total === 'number'
                ? page.meta.total
                : data.length
            const newTotal = had ? Math.max(0, prevTotal - 1) : prevTotal

            return {
              ...page,
              data: newData,
              meta: {
                ...(page.meta || {}),
                total: newTotal
              }
            }
          })

          return {
            ...oldData,
            pages: newPages
          }
        }
      )
    },
    [queryClient]
  )

  const replaceTempMessage = useCallback(
    (tempId: string, actualMessage: Message) => {
      queryClient.setQueriesData(
        { queryKey: ['messages', 'list', actualMessage.chatId] },
        (oldData: any) => {
          if (!oldData) {
            return {
              pages: [
                {
                  data: [actualMessage],
                  meta: safeDefaultMeta()
                }
              ],
              pageParams: [null]
            }
          }

          const pages = Array.isArray(oldData.pages) ? oldData.pages : []
          let replaced = false

          const newPages = pages.map((page: PaginatedResponse<Message[]>) => {
            if (!Array.isArray(page.data)) return page
            const newData = page.data.map((m: Message) => {
              if (m.id === tempId) {
                replaced = true
                return actualMessage
              }
              return m
            })
            return { ...page, data: newData }
          })

          if (!replaced) {
            const first = newPages[0] ?? { data: [], meta: safeDefaultMeta() }
            const firstData = Array.isArray(first.data) ? first.data : []
            const newFirst = {
              ...first,
              data: [actualMessage, ...firstData],
              meta: {
                ...(first.meta || safeDefaultMeta()),
                total: (first.meta?.total ?? firstData.length) + 1
              }
            }
            const restPages = newPages.slice(1)
            const pageParams = Array.isArray(oldData.pageParams)
              ? oldData.pageParams
              : [null]
            return {
              ...oldData,
              pages: [newFirst, ...restPages],
              pageParams
            }
          }

          const pageParams = Array.isArray(oldData.pageParams)
            ? oldData.pageParams
            : [null]
          return {
            ...oldData,
            pages: newPages,
            pageParams
          }
        }
      )
    },
    [queryClient]
  )

  const addMessageToCache = useCallback(
    (message: Message) => {
      const chatId = message.chatId
      queryClient.setQueriesData(
        { queryKey: ['messages', 'list', chatId] },
        (oldData: any) => {
          if (!oldData) {
            return {
              pages: [
                {
                  data: [message],
                  meta: safeDefaultMeta()
                }
              ],
              pageParams: [null]
            }
          }

          const pages = Array.isArray(oldData.pages) ? oldData.pages : []
          const pageParams = Array.isArray(oldData.pageParams)
            ? oldData.pageParams
            : [null]

          const firstPage = pages[0] ?? { data: [], meta: safeDefaultMeta() }
          const firstData = Array.isArray(firstPage.data) ? firstPage.data : []

          if (firstData.some((m: Message) => m.id === message.id))
            return oldData

          const newFirstPage = {
            ...firstPage,
            data: [message, ...firstData],
            meta: {
              ...(firstPage.meta || safeDefaultMeta()),
              total: (firstPage.meta?.total ?? firstData.length) + 1
            }
          }

          const restPages = pages.slice(1)

          return {
            ...oldData,
            pages: [newFirstPage, ...restPages],
            pageParams
          }
        }
      )
    },
    [queryClient]
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return useMemo(
    () => ({
      messages,
      fetchNextPage: loadMore,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      error,
      refetch,
      isFetching,
      total: data?.pages[0]?.meta.total ?? 0,
      isEmpty: messages.length === 0,
      updateMessageInCache,
      removeMessageFromCache,
      replaceTempMessage,
      addMessageToCache
    }),
    [
      messages,
      loadMore,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      error,
      refetch,
      isFetching,
      data?.pages,
      updateMessageInCache,
      removeMessageFromCache,
      replaceTempMessage,
      addMessageToCache
    ]
  )
}
