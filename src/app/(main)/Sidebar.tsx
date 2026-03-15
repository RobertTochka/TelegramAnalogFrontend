'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'

import { ChatList, CreateChatDialog } from '@/components/chat-list'
import { Button } from '@/components/ui'
import { UserAvatar } from '@/components/user/UserAvatar'

import { APP_NAME } from '@/constants'
import { ChatFilter, Profile } from '@/types'

interface SidebarProps {
  currentUser: Profile
  selectedChatId: string
  searchQuery: string
  chatsQuery: ChatFilter
  setChatsQuery: Dispatch<SetStateAction<ChatFilter>>
  setSearchQuery: Dispatch<SetStateAction<string>>
  setSelectedChatId: Dispatch<SetStateAction<string>>
}

export const Sidebar = ({
  currentUser,
  selectedChatId,
  setSelectedChatId,
  searchQuery,
  setSearchQuery,
  chatsQuery,
  setChatsQuery
}: SidebarProps) => {
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
        <Link
          className='relative shrink-0'
          href={`profile`}
        >
          <UserAvatar
            avatar={currentUser.avatar}
            firstName={currentUser.firstName}
          />
        </Link>
      </div>

      <ChatList
        currentUserId={currentUser.id}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatsQuery={chatsQuery}
        setChatsQuery={setChatsQuery}
      />

      <div className='border-t border-white/5 p-4'>
        <CreateChatDialog
          onCreated={id => setSelectedChatId(id)}
          trigger={
            <Button className='relative w-full overflow-hidden bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'>
              Новый чат
            </Button>
          }
        />
      </div>
    </div>
  )
}
