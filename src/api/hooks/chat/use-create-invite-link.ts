import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useCreateInviteLink = (chatId: string) => {
  const {
    mutate: createInviteLink,
    isPending: isLoadingCreate,
    data
  } = useMutation({
    mutationKey: ['create invite link', chatId],
    mutationFn: (options?: { maxUses?: number; expiresAt?: string }) =>
      api.post(`/chats/${chatId}/invite`, options).then(res => res.data),
    onSuccess: data => {
      navigator.clipboard?.writeText(data.link)
      toast.success('Ссылка скопирована в буфер обмена')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при создании ссылки'
      )
    }
  })

  return useMemo(
    () => ({
      createInviteLink,
      isLoadingCreate,
      inviteLink: data?.link
    }),
    [createInviteLink, isLoadingCreate, data]
  )
}
