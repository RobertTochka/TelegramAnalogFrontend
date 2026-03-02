import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { ChangePasswordDto } from '@/types'

export const useChangePassword = () => {
  const queryClient = useQueryClient()

  const { mutate: changePassword, isPending: isLoadingChangePassword } =
    useMutation({
      mutationKey: ['change password'],
      mutationFn: (dto: ChangePasswordDto) =>
        api.patch<void>('/users/change-password', dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['me'] })
        toast.success('Пароль обновлен')
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || 'Ошибка при обновлении парооля'
        )
      }
    })

  return useMemo(
    () => ({
      changePassword,
      isLoadingChangePassword
    }),
    [changePassword, isLoadingChangePassword]
  )
}
