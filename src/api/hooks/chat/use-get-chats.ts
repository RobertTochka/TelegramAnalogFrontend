import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { api } from '@/api/api'

import { Chat, ChatFilter, PaginatedResponse } from '@/types'

export const useGetChats = (filters: ChatFilter = {}) => {
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
    queryKey: ['chats', 'list', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })

      params.set('page', String(pageParam))

      const { data } = await api.get<PaginatedResponse<Chat[]>>(
        `/chats?${params.toString()}`
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
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  const chats = useMemo(() => {
    return data?.pages.flatMap(page => page.data) ?? []
  }, [data])

  const updateChatInCache = useCallback(
    (chatId: string, updates: Partial<Chat>) => {
      queryClient.setQueryData(['chats', 'list', filters], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Chat[]>) => ({
            ...page,
            data: page.data.map(chat =>
              chat.id === chatId ? { ...chat, ...updates } : chat
            )
          }))
        }
      })
    },
    [queryClient, filters]
  )

  const removeChatFromCache = useCallback(
    (chatId: string) => {
      queryClient.setQueryData(['chats', 'list', filters], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Chat[]>) => ({
            ...page,
            data: page.data.filter((chat: Chat) => chat.id !== chatId),
            meta: {
              ...page.meta,
              total: page.meta.total - 1
            }
          }))
        }
      })
    },
    [queryClient, filters]
  )

  const addChatToCache = useCallback(
    (newChat: Chat) => {
      queryClient.setQueryData(['chats', 'list', filters], (oldData: any) => {
        if (!oldData) return oldData

        const firstPage = oldData.pages[0]
        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              data: [newChat, ...firstPage.data],
              meta: {
                ...firstPage.meta,
                total: firstPage.meta.total + 1
              }
            },
            ...oldData.pages.slice(1)
          ]
        }
      })
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
      chats,
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
      isEmpty: chats.length === 0,
      updateChatInCache,
      removeChatFromCache,
      addChatToCache
    }),
    [
      chats,
      loadMore,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      error,
      refetch,
      isFetching,
      data?.pages,
      updateChatInCache,
      removeChatFromCache,
      addChatToCache
    ]
  )
}
