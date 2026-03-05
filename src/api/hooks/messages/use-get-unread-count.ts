import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

export const useGetUnreadCount = (chatId?: string) => {
  const {
    data: unreadCount,
    isLoading: isLoadingUnread,
    refetch
  } = useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: async () => {
      const paramsString = `?chatId=${chatId}`
      const { data } = await api.get<number | Record<string, number>>(
        `/messages/unread${chatId ? paramsString : ''}`
      )
      return data
    },
    refetchInterval: 30000
  })

  return useMemo(
    () => ({
      unreadCount,
      isLoadingUnread,
      refetch
    }),
    [unreadCount, isLoadingUnread, refetch]
  )
}
