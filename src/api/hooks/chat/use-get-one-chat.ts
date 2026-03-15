import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Chat } from '@/types'

export const useGetOneChat = (id: string) => {
  const queryClient = useQueryClient()

  const {
    data: chat,
    isLoading: isLoadingChat,
    error
  } = useQuery({
    queryKey: ['chats', 'detail', id],
    queryFn: () => api.get<Chat>(`/chats/${id}`).then(res => res.data),
    initialData: () => {
      const queries = queryClient.getQueriesData({
        queryKey: ['chats', 'list']
      })

      for (const [, data] of queries) {
        const infinite = data as any
        if (!infinite?.pages) continue

        for (const page of infinite.pages) {
          const found: Chat = page.data?.find((c: Chat) => c.id === id)
          if (found) return found
        }
      }

      return undefined
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

  return useMemo(
    () => ({
      chat,
      isLoadingChat,
      error
    }),
    [chat, isLoadingChat, error]
  )
}
