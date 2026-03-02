import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { GetFriendsResponseDto } from '@/types'

export const useGetFriends = () => {
  const {
    data: friendResponse,
    isLoading: isLoadingFriendResponse,
    error: friendResponseError
  } = useQuery({
    queryKey: ['friends'],
    queryFn: () =>
      api.get<GetFriendsResponseDto>(`/users/friends`).then(res => res.data)
  })

  return useMemo(
    () => ({
      friendResponse,
      isLoadingFriendResponse,
      friendResponseError
    }),
    [friendResponse, isLoadingFriendResponse, friendResponseError]
  )
}
