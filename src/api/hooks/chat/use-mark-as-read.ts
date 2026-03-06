import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  const { mutate: markChatAsRead, isPending: isLoadingMarkChatAsRead } =
    useMutation({
      mutationKey: ['mark as read'],
      mutationFn: (chatId: string) =>
        api.post(`/chats/${chatId}/read`).then(res => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || 'Ошибка при прочтении чата'
        )
      }
    })

  return useMemo(
    () => ({
      markChatAsRead,
      isLoadingMarkChatAsRead
    }),
    [markChatAsRead, isLoadingMarkChatAsRead]
  )
}
