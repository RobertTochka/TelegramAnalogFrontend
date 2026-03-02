import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

export const useAddFriend = () => {
  const queryClient = useQueryClient()

  const { mutate: addFriend, isPending: isLoadingAddFriend } = useMutation({
    mutationKey: ['add friend'],
    mutationFn: (dto: { friendId: string }) =>
      api.post<void>('/users/friends', dto.friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
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
      addFriend,
      isLoadingAddFriend
    }),
    [addFriend, isLoadingAddFriend]
  )
}
