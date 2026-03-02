import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Chat, PaginatedResponse } from '@/types'

export const useGetOneChat = (id: string) => {
  const queryClient = useQueryClient()

  const {
    data: chat,
    isLoading: isLoadingChat,
    error
  } = useQuery({
    queryKey: ['chats', 'detail', id],
    queryFn: () => api.get<Chat>(`/chats/${id}`).then(res => res.data),
    enabled: !!id,
    initialData: () => {
      const chats = queryClient.getQueryData<PaginatedResponse<Chat[]>>([
        'chats',
        'list'
      ])
      return chats?.data?.find(c => c.id === id)
    },
    staleTime: 1000 * 60 * 1
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
