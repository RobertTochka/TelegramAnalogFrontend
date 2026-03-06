import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { api } from '@/api/api'

import {
  Chat,
  ChatFilter,
  EnumParticipantRole,
  PaginatedResponse
} from '@/types'

export const useGetChats = (filters: Omit<ChatFilter, 'cursor'>) => {
  const queryKey = ['chats', 'list', JSON.stringify(filters)]
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
    queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })

      if (pageParam) {
        params.set('cursor', pageParam)
      }

      const { data } = await api.get<PaginatedResponse<Chat[]>>(
        `/chats?${params.toString()}`
      )

      return data
    },
    getNextPageParam: lastPage => {
      return lastPage.meta.nextCursor
    },
    initialPageParam: null,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  const chats = useMemo(() => {
    if (!data) return []

    return data.pages.flatMap(page => page.data)
  }, [data])

  const updateChatInCache = useCallback(
    (chatId: string, updates: Partial<Chat>) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
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
    [queryClient, queryKey]
  )

  const updateChatParticipantsInCache = useCallback(
    (chatId: string, userId: string, isDelete: boolean) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: PaginatedResponse<Chat[]>) => ({
            ...page,
            data: page.data.map(chat => {
              if (chat.id === chatId) {
                if (isDelete) {
                  return {
                    ...chat,
                    participants: (chat.participants || []).filter(
                      p => p.id !== userId
                    )
                  }
                } else {
                  const existingParticipant = chat.participants?.find(
                    p => p.id === userId
                  )

                  if (existingParticipant) {
                    return chat
                  }

                  return {
                    ...chat,
                    participants: [
                      ...(chat.participants || []),
                      {
                        id: userId,
                        joinedAt: new Date().toISOString(),
                        role: EnumParticipantRole.MEMBER
                      }
                    ]
                  }
                }
              }
              return chat
            })
          }))
        }
      })
    },
    [queryClient, queryKey]
  )

  const removeChatFromCache = useCallback(
    (chatId: string) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
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
    [queryClient, queryKey]
  )

  const addChatToCache = useCallback(
    (newChat: Chat) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData)
          return {
            pages: [
              {
                data: [newChat],
                meta: {
                  total: 1,
                  limit: 50,
                  nextCursor: null,
                  hasNextPage: false
                }
              }
            ],
            pageParams: [null]
          }

        const chatExists = oldData.pages.some((page: any) =>
          page.data.some((chat: Chat) => chat.id === newChat.id)
        )

        if (chatExists) {
          return oldData
        }

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
    [queryClient, queryKey]
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
      total: data?.pages[0]?.meta.total ?? 0,
      isEmpty: chats.length === 0,
      updateChatInCache,
      updateChatParticipantsInCache,
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
      updateChatParticipantsInCache,
      removeChatFromCache,
      addChatToCache
    ]
  )
}
