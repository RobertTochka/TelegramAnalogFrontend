import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { api } from '@/api/api'

import { Message, MessageFilter, PaginatedResponse } from '@/types'

export const useGetMessages = (
  chatId: string,
  filters: Omit<MessageFilter, 'page'> = {}
) => {
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
    queryKey: ['messages', 'list', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })

      params.set('page', String(pageParam))

      const { data } = await api.get<PaginatedResponse<Message[]>>(
        `/messages/${chatId}?${params.toString()}`
      )

      return data
    },
    getNextPageParam: lastPage => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined
    },
    getPreviousPageParam: firstPage => {
      return firstPage.meta.hasPreviousPage
        ? firstPage.meta.page - 1
        : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!chatId
  })

  const messages = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  )

  const updateMessageInCache = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      queryClient.setQueryData(
        ['messages', 'list', filters],
        (oldData: any) => {
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
        }
      )
    },
    [queryClient, filters]
  )

  const removeMessageFromCache = useCallback(
    (messageId: string) => {
      queryClient.setQueryData(
        ['messages', 'list', filters],
        (oldData: any) => {
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
        }
      )
    },
    [queryClient, filters]
  )

  const addMessageToCache = useCallback(
    (newMessage: Message) => {
      queryClient.setQueryData(
        ['messages', 'list', filters],
        (oldData: any) => {
          if (!oldData) return oldData

          const firstPage = oldData.pages[0]
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                data: [newMessage, ...firstPage.data],
                meta: {
                  ...firstPage.meta,
                  total: firstPage.meta.total + 1
                }
              },
              ...oldData.pages.slice(1)
            ]
          }
        }
      )
    },
    [queryClient, filters]
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
      totalPages: data?.pages[0]?.meta.totalPages ?? 0,
      total: data?.pages[0]?.meta.total ?? 0,
      currentPage: data?.pages[data.pages.length - 1]?.meta.page ?? 1,
      isEmpty: messages.length === 0,
      updateMessageInCache,
      removeMessageFromCache,
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
      addMessageToCache
    ]
  )
}
