'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { useJoinByLink } from '@/api/hooks/chat/use-join-by-invite-link'

export const InviteMainPage = () => {
  const router = useRouter()

  const { joinByLink, isLoadingJoinByLink } = useJoinByLink()

  useEffect(() => {
    joinByLink(undefined, {
      onError: error => {
        toast.error(
          error.message || 'Ошибка при присоединении к чату по ссылке'
        )
        router.push('/chats')
      },
      onSuccess: chat => {
        router.push(`/chats?chatId=${chat.id}`)
      }
    })
  }, [])

  return (
    <div className='flex justify-center py-2'>
      <Loader2 className='h-5 w-5 animate-spin text-purple-500' />
    </div>
  )
}
