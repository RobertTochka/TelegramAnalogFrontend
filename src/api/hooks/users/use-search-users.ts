import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

import { User } from '@/types'

export const useSearchUsers = (query: string) => {
  const { data: users, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['search users', query],
    queryFn: () =>
      api.get<User[]>('/users', { params: { q: query } }).then(res => res.data),
    enabled: query.length > 2
  })

  return useMemo(
    () => ({
      users,
      isLoadingSearch
    }),
    [users, isLoadingSearch]
  )
}
