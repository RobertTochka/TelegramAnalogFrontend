'use client'

import { LogOut, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'

import { useLogout } from '@/api/hooks/auth'

import { ChatList } from '@/components/chat-list'
import { Button } from '@/components/ui'

import { APP_NAME } from '@/constants'
import { ChatFilter } from '@/types'

interface SidebarProps {
  selectedChatId: string
  searchQuery: string
  chatsQuery: ChatFilter
  setChatsQuery: Dispatch<SetStateAction<ChatFilter>>
  setSearchQuery: Dispatch<SetStateAction<string>>
  setSelectedChatId: Dispatch<SetStateAction<string>>
}

export const Sidebar = ({
  selectedChatId,
  setSelectedChatId,
  searchQuery,
  setSearchQuery,
  chatsQuery,
  setChatsQuery
}: SidebarProps) => {
  const router = useRouter()
  const { logout, isLoadingLogout } = useLogout()

  const handleLogout = async () => {
    try {
      logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className='relative z-10 flex w-96 flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl'>
      <div className='flex items-center justify-between border-b border-white/5 p-4'>
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <div className='absolute inset-0 animate-pulse rounded-lg bg-linear-to-r from-purple-600 to-blue-600 blur-sm' />
            <div className='relative rounded-lg bg-linear-to-r from-purple-600 to-blue-600 p-1.5'>
              <MessageCircle className='h-5 w-5 text-white' />
            </div>
          </div>
          <h2 className='bg-linear-to-r from-white to-gray-400 bg-clip-text font-semibold text-transparent'>
            {APP_NAME}
          </h2>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleLogout}
          disabled={isLoadingLogout}
          className='text-gray-400 transition-all hover:bg-slate-800 hover:text-white'
        >
          <LogOut className='h-5 w-5' />
        </Button>
      </div>

      <ChatList
        currentUserId='cmmamev7e0000b4viz7qwhvro'
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatsQuery={chatsQuery}
        setChatsQuery={setChatsQuery}
      />
    </div>
  )
}
