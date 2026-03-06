import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useAddAdmin = (chatId: string) => {
  const queryClient = useQueryClient()

  const { mutate: addAdmin, isPending: isLoadingAddAdmin } = useMutation({
    mutationKey: ['add admin'],
    mutationFn: (adminId: string) =>
      api.post(`/chats/${chatId}/admins`, adminId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', chatId] })
      toast.success('Администратор добавлен')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при добавлении администратора'
      )
    }
  })

  return useMemo(
    () => ({
      addAdmin,
      isLoadingAddAdmin
    }),
    [addAdmin, isLoadingAddAdmin]
  )
}
