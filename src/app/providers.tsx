'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import { TooltipProvider } from '@/components/ui'

import { UserStatusProvider } from '@/contexts/UserStatusContext'
import { SocketProvider } from '@/web-socket/SocketProvider'

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnReconnect: true
        }
      }
    })
  )

  return (
    <SocketProvider>
      <QueryClientProvider client={client}>
        <UserStatusProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </UserStatusProvider>
      </QueryClientProvider>
    </SocketProvider>
  )
}
