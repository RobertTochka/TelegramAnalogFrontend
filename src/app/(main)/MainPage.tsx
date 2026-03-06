'use client'

import { Loader2, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useGetProfile } from '@/api/hooks/users'

import { ChatContainer } from '@/components/chat-window'

import { Sidebar } from './Sidebar'
import { ChatFilter } from '@/types'

export const MainPage = () => {
  const [selectedChatId, setSelectedChatId] = useState('')
  const [searchChatsQuery, setSearchChatsQuery] = useState('')
  const [chatsQuery, setChatsQuery] = useState<ChatFilter>({
    limit: 20,
    search: searchChatsQuery || undefined
  })

  const { profile, isLoadingProfile } = useGetProfile()

  if (isLoadingProfile) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='relative'>
          <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
          <Loader2 className='relative h-8 w-8 animate-spin text-purple-500' />
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950'>
      <Sidebar
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        searchQuery={searchChatsQuery}
        setSearchQuery={setSearchChatsQuery}
        chatsQuery={chatsQuery}
        setChatsQuery={setChatsQuery}
      />

      {/* Основная область чата */}
      <div className='relative z-10 flex flex-1 flex-col bg-slate-950/50 backdrop-blur-sm'>
        {selectedChatId ? (
          <ChatContainer
            chatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            currentUser={profile!}
            chatsQuery={chatsQuery}
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center text-center'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
              <div className='relative rounded-full bg-linear-to-r from-purple-600 to-blue-600 p-4'>
                <MessageCircle className='h-12 w-12 text-white' />
              </div>
            </div>
            <h3 className='mb-2 text-xl font-semibold text-white'>
              Выберите чат
            </h3>
            <p className='max-w-xs text-sm text-gray-400'>
              Начните общение, выбрав существующий чат или создав новый
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
