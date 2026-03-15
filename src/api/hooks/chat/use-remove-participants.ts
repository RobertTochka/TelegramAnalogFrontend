import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useRemoveParticipants = (chatId: string) => {
  const queryClient = useQueryClient()

  const { mutate: removeParticipants, isPending: isLoadingRemove } =
    useMutation({
      mutationKey: ['remove participants', chatId],
      mutationFn: (participantIds: string[]) =>
        api
          .post(`/chats/${chatId}/participants`, { participantIds })
          .then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
        toast.success('Участники удалены')
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || 'Ошибка при удалении участников'
        )
      }
    })

  return useMemo(
    () => ({
      removeParticipants,
      isLoadingRemove
    }),
    [removeParticipants, isLoadingRemove]
  )
}
