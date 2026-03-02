import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useLeaveChat = () => {
  const queryClient = useQueryClient()

  const { mutate: leaveChat, isPending: isLoadingLeave } = useMutation({
    mutationKey: ['leave chat'],
    mutationFn: (chatId: string) =>
      api.post(`/chats/${chatId}/leave`).then(res => res.data),
    onSuccess: (_, chatId) => {
      queryClient.removeQueries({ queryKey: ['chats', 'detail', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      toast.success('Вы вышли из чата')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при выходе из чата')
    }
  })

  return useMemo(
    () => ({
      leaveChat,
      isLoadingLeave
    }),
    [leaveChat, isLoadingLeave]
  )
}
