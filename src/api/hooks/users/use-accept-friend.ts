import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useAcceptFriend = () => {
  const queryClient = useQueryClient()

  const { mutate: acceptFriend, isPending: isLoadingAcceptFriend } =
    useMutation({
      mutationKey: ['accept friend'],
      mutationFn: (dto: { friendId: string }) =>
        api.patch<void>('/users/friends', dto.friendId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['me'] })
        toast.success('Приглашение отправлено')
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || 'Ошибка при отправке приглашения'
        )
      }
    })

  return useMemo(
    () => ({
      acceptFriend,
      isLoadingAcceptFriend
    }),
    [acceptFriend, isLoadingAcceptFriend]
  )
}
