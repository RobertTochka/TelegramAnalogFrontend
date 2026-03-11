import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/api'

import { EnumFriendshipStatus } from '@/types'

export const usePatchFriend = () => {
  const queryClient = useQueryClient()

  const { mutate: patchFriend, isPending: isLoadingPatchFriend } = useMutation({
    mutationKey: ['patch friend'],
    mutationFn: (dto: { friendId: string; status: EnumFriendshipStatus }) =>
      api.patch<void>('/users/friends', dto),
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
      patchFriend,
      isLoadingPatchFriend
    }),
    [patchFriend, isLoadingPatchFriend]
  )
}
