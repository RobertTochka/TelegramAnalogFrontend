import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useRemoveAdmin = (chatId: string) => {
  const queryClient = useQueryClient()

  const { mutate: removeAdmin, isPending: isLoadingRemoveAdmin } = useMutation({
    mutationKey: ['remove admin'],
    mutationFn: (adminId: string) =>
      api.post(`/chats/${chatId}/admins`, adminId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      toast.success('Администратор удален')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при удалении администратора'
      )
    }
  })

  return useMemo(
    () => ({
      removeAdmin,
      isLoadingRemoveAdmin
    }),
    [removeAdmin, isLoadingRemoveAdmin]
  )
}
