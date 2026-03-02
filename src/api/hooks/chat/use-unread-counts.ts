import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

export const useUnreadCounts = () => {
  const {
    data: unreadCounts,
    isLoading: isLoadingUnread,
    refetch
  } = useQuery({
    queryKey: ['chats', 'unread'],
    queryFn: () =>
      api.get<Record<string, number>>('/chats/unread').then(res => res.data),
    refetchInterval: 30000
  })

  return useMemo(
    () => ({
      unreadCounts,
      isLoadingUnread,
      refetchUnread: refetch
    }),
    [unreadCounts, isLoadingUnread, refetch]
  )
}
