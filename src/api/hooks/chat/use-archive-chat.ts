import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useArchiveChat = () => {
  const queryClient = useQueryClient()

  const { mutate: archiveChat, isPending: isLoadingArchive } = useMutation({
    mutationKey: ['archive chat'],
    mutationFn: ({ chatId, archive }: { chatId: string; archive: boolean }) =>
      api.post(`/chats/${chatId}/archive`, { archive }).then(res => res.data),
    onSuccess: (_, { chatId, archive }) => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      toast.success(archive ? 'Чат архивирован' : 'Чат разархивирован')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при архивации чата')
    }
  })

  return useMemo(
    () => ({
      archiveChat,
      isLoadingArchive
    }),
    [archiveChat, isLoadingArchive]
  )
}
