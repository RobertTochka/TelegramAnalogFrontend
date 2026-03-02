import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const usePinChat = () => {
  const queryClient = useQueryClient()

  const { mutate: pinChat, isPending: isLoadingPin } = useMutation({
    mutationKey: ['pin chat'],
    mutationFn: ({ chatId, pin }: { chatId: string; pin: boolean }) =>
      api.post(`/chats/${chatId}/pin`, { pin }).then(res => res.data),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при закреплении чата'
      )
    }
  })

  return useMemo(
    () => ({
      pinChat,
      isLoadingPin
    }),
    [pinChat, isLoadingPin]
  )
}
