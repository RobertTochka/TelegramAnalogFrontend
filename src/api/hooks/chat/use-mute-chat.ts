import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useMuteChat = () => {
  const queryClient = useQueryClient()

  const { mutate: muteChat, isPending: isLoadingMute } = useMutation({
    mutationKey: ['mute chat'],
    mutationFn: ({
      chatId,
      muteUntil
    }: {
      chatId: string
      muteUntil: string
    }) =>
      api.post(`/chats/${chatId}/mute`, { muteUntil }).then(res => res.data),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      toast.success('Настройки звука обновлены')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при настройке звука'
      )
    }
  })

  return useMemo(
    () => ({
      muteChat,
      isLoadingMute
    }),
    [muteChat, isLoadingMute]
  )
}
