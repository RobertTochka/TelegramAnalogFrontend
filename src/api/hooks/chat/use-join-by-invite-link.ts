import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Chat } from '@/types'

export const useJoinByLink = () => {
  const params = useParams<{ inviteLink: string }>()
  const queryClient = useQueryClient()

  const {
    mutate: joinByLink,
    isPending: isLoadingJoinByLink,
    error
  } = useMutation({
    mutationKey: ['join by link', params.inviteLink],
    mutationFn: () =>
      api.post<Chat>(`/chats/join/${params.inviteLink}`).then(res => res.data),
    onSuccess: chat =>
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chat.id] })
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
