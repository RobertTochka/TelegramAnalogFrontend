import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { IVerificationData } from '@/types'

export const useVerify = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate: verify, isPending: isLoadingVerify } = useMutation({
    mutationKey: ['verify'],
    mutationFn: (data: IVerificationData) =>
      api.post('/auth/new-verification', data).then(res => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка при регистрации')
    }
  })

  return useMemo(
    () => ({
      verify,
      isLoadingVerify
    }),
    [verify, isLoadingVerify]
  )
}
