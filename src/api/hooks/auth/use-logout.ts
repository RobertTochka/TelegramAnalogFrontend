import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate: logout, isPending: isLoadingLogout } = useMutation({
    mutationKey: ['logout'],
    mutationFn: () => api.post('/auth/logout').then(res => res.data),
    onSuccess: () => {
      queryClient.clear()
      router.push('/auth')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при выходе')
    }
  })

  return useMemo(
    () => ({
      logout,
      isLoadingLogout
    }),
    [logout, isLoadingLogout]
  )
}
