import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { Chat, CreateChatDto } from '@/types'

export const useUpdateChat = (chatId: string) => {
  const queryClient = useQueryClient()

  const { mutate: updateChat, isPending: isLoadingUpdate } = useMutation({
    mutationKey: ['update chat', chatId],
    mutationFn: (data: Partial<CreateChatDto>) =>
      api.put<Chat>(`/chats/${chatId}`, data).then(res => res.data),
    onSuccess: updatedChat => {
      queryClient.setQueryData(['chats', 'detail', chatId], updatedChat)
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при обновлении чата'
      )
    }
  })

  return useMemo(
    () => ({
      updateChat,
      isLoadingUpdate
    }),
    [updateChat, isLoadingUpdate]
  )
}
