import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { api } from '@/api/api'

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  const { mutate: updateStatus, isPending: isLoadingUpdateStatus } =
    useMutation({
      mutationKey: ['update user status'],
      mutationFn: ({ userId, status }: { userId: string; status: string }) =>
        api.patch(`/users/${userId}/status`, { status }).then(res => res.data),
      onSuccess: (_, { userId }) => {
        queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['chats'] })
      }
    })

  return useMemo(
    () => ({
      updateStatus,
      isLoadingUpdateStatus
    }),
    [updateStatus, isLoadingUpdateStatus]
  )
}
