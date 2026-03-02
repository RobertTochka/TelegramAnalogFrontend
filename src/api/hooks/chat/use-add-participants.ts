import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useAddParticipants = (chatId: string) => {
  const queryClient = useQueryClient()

  const { mutate: addParticipants, isPending: isLoadingAdd } = useMutation({
    mutationKey: ['add participants', chatId],
    mutationFn: (participantIds: string[]) =>
      api
        .post(`/chats/${chatId}/participants`, { participantIds })
        .then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      toast.success('Участники добавлены')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при добавлении участников'
      )
    }
  })

  return useMemo(
    () => ({
      addParticipants,
      isLoadingAdd
    }),
    [addParticipants, isLoadingAdd]
  )
}
