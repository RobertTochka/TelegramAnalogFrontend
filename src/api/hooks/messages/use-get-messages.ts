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
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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

  const updateMessageInCache = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Message[]>) => ({
            ...page,
            data: page.data.map(message =>
              message.id === messageId ? { ...message, ...updates } : message
            )
          }))
        }
      })
    },
    [queryClient, queryKey]
  )

  const removeMessageFromCache = useCallback(
    (messageId: string) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Message[]>) => ({
            ...page,
            data: page.data.filter(
              (message: Message) => message.id !== messageId
            ),
            meta: {
              ...page.meta,
              total: page.meta.total - 1
            }
          }))
        }
      })
    },
    [queryClient, queryKey]
  )

  const replaceTempMessage = useCallback(
    (tempId: string, actualMessage: Message) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Message[]>) => ({
            ...page,
            data: page.data.map((message: Message) =>
              message.id === tempId ? actualMessage : message
            )
          }))
        }
      })
    },
    []
  )

  const addMessageToCache = useCallback(
    (message: Message) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old

        const firstPage = old.pages[0]

        if (firstPage.data.find((m: Message) => m.id === message.id)) return old

        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [message, ...firstPage.data]
            },
            ...old.pages.slice(1)
          ]
        }
      })
    },
    [queryClient, queryKey]
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
