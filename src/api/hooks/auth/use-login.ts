import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { ILoginData } from '@/types'

export const useLogin = () => {
  const { mutate: login, isPending: isLoadingLogin } = useMutation({
    mutationKey: ['login'],
    mutationFn: (credentials: ILoginData) =>
      api.post<string>('/auth/login', credentials).then(res => res.data),
    onSuccess: async (message: string) => {
      toast.success(message)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при входе')
    }
  })

  return useMemo(
    () => ({
      login,
      isLoadingLogin
    }),
    [login, isLoadingLogin]
  )
}
