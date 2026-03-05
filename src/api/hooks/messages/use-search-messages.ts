import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Message } from '@/types'

export const useSearchMessages = (query: string, chatId?: string) => {
  const {
    data: messages,
    isLoading,
    error
  } = useQuery({
    queryKey: ['messages', 'search', chatId, query],
    queryFn: async () => {
      const { data } = await api.get<Message[]>('/messages/search', {
        params: { q: query, chatId }
      })
      return data
    },
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5
  })

  return useMemo(
    () => ({
      messages,
      isLoading,
      error
    }),
    [messages, isLoading, error]
  )
}
