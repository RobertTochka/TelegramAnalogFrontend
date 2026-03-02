import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { IRegisterData } from '@/types'

export const useRegister = () => {
  const { mutate: register, isPending: isLoadingRegister } = useMutation({
    mutationKey: ['register'],
    mutationFn: (userData: IRegisterData) =>
      api.post<string>('/auth/register', userData).then(res => res.data),
    onSuccess: async (message: string) => {
      toast.success(message)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при регистрации')
    }
  })

  return useMemo(
    () => ({
      register,
      isLoadingRegister
    }),
    [register, isLoadingRegister]
  )
}
