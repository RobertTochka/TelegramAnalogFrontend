import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { User } from '@/types'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  const { mutate: updateProfile, isPending: isLoadingUpdate } = useMutation({
    mutationKey: ['update profile'],
    mutationFn: (userData: Partial<User>) =>
      api.patch<User>('/users/profile', userData).then(res => res.data),
    onSuccess: updatedUser => {
      queryClient.setQueryData(['me'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Профиль обновлен')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Ошибка при обновлении профиля'
      )
    }
  })

  return useMemo(
    () => ({
      updateProfile,
      isLoadingUpdate
    }),
    [updateProfile, isLoadingUpdate]
  )
}
