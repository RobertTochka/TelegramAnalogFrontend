import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

export const useCreateInviteLink = (chatId: string) => {
  const { data: inviteLink, isPending: isLoadingCreate } = useQuery({
    queryKey: ['create invite link', chatId],
    queryFn: () => api.get(`/chats/${chatId}/invite-link`).then(res => res.data)
  })

  return useMemo(
    () => ({
      inviteLink,
      isLoadingCreate
    }),
    [inviteLink, isLoadingCreate]
  )
}
