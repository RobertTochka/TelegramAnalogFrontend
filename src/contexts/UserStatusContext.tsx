'use client'

import { usePresence } from '@/web-socket/hooks'

export const UserStatusProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  usePresence()

  return <>{children}</>
}
