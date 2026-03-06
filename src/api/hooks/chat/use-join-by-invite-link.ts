import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Chat } from '@/types'

export const useJoinByLink = (inviteLink: string) => {
  const {
    data: joinByLink,
    isLoading: isLoadingJoinByLink,
    error
  } = useQuery({
    queryKey: ['chats', 'detail', inviteLink],
    queryFn: () =>
      api.get<Chat>(`/chats/join/${inviteLink}`).then(res => res.data),
    enabled: !!inviteLink,
    staleTime: 1000 * 60 * 1
  })

  return useMemo(
    () => ({
      joinByLink,
      isLoadingJoinByLink,
      error
    }),
    [joinByLink, isLoadingJoinByLink, error]
  )
}
