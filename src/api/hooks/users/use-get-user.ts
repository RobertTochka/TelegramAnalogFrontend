import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { User } from '@/types'

export const useGetUser = () => {
  const params = useParams<{ userId: string }>()

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError
  } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      api.get<User>(`/users/profile/${params.userId}`).then(res => res.data)
  })

  return useMemo(
    () => ({
      user,
      isLoadingUser,
      userError
    }),
    [user, isLoadingUser, userError]
  )
}
