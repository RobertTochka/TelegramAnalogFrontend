'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const MainPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/chats')
  }, [])

  return null
}
