import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useDeleteChat = () => {
  const queryClient = useQueryClient()

  const { mutate: deleteChat, isPending: isLoadingDelete } = useMutation({
    mutationKey: ['delete chat'],
    mutationFn: (chatId: string) =>
      api.delete(`/chats/${chatId}`).then(res => res.data),
    onSuccess: (_, chatId) => {
      queryClient.removeQueries({ queryKey: ['chats', 'detail', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      toast.success('Чат удален')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при удалении чата')
    }
  })

  return useMemo(
    () => ({
      deleteChat,
      isLoadingDelete
    }),
    [deleteChat, isLoadingDelete]
  )
}
