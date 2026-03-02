import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { Profile } from '@/types'

export const useGetProfile = () => {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<Profile>('/users/profile').then(res => res.data),
    retry: false,
    staleTime: 1000 * 60 * 5
  })

  return useMemo(
    () => ({
      profile,
      isLoadingProfile,
      profileError
    }),
    [profile, isLoadingProfile, profileError]
  )
}
