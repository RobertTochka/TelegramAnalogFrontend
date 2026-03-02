import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { Chat, CreateChatDto } from '@/types'

export const useCreateChat = () => {
  const queryClient = useQueryClient()

  const { mutate: createChat, isPending: isLoadingCreate } = useMutation({
    mutationKey: ['create chat'],
    mutationFn: (data: CreateChatDto) =>
      api.post<Chat>('/chats', data).then(res => res.data),
    onSuccess: newChat => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      queryClient.setQueryData(['chats', 'detail', newChat.id], newChat)
      toast.success('Чат создан')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при создании чата')
    }
  })

  return useMemo(
    () => ({
      createChat,
      isLoadingCreate
    }),
    [createChat, isLoadingCreate]
  )
}
