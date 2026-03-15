'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useGetMessages } from '@/api/hooks/messages'
import { useGetProfile } from '@/api/hooks/users'

import { ChatContainer } from '@/components/chat-window'

import { Sidebar } from '../Sidebar'

import { ChatFilter, MessageFilter } from '@/types'
import { useMessageSocket } from '@/web-socket/hooks'

export const ChatsPageComp = () => {
  const [selectedChatId, setSelectedChatId] = useState('')
  const [searchChatsQuery, setSearchChatsQuery] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [chatsQuery, setChatsQuery] = useState<ChatFilter>({
    limit: 20
  })
  const [messagesQuery, setMessagesQuery] = useState<
    Omit<MessageFilter, 'page'>
  >({
    limit: 40
  })
  const { profile, isLoadingProfile } = useGetProfile()

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isEmpty,

    addMessageToCache,
    updateMessageInCache,
    removeMessageFromCache,
    replaceTempMessage
  } = useGetMessages(selectedChatId, messagesQuery)

  const { sendMessage, editMessage, deleteMessage, sendTyping, markAsRead } =
    useMessageSocket({
      currentUserId: profile ? profile.id : '',
      chatsQuery,
      chatId: selectedChatId,

      addMessageToCache,
      updateMessageInCache,
      removeMessageFromCache,
      replaceTempMessage,

      onTyping: data => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })
      }
    })

  useEffect(() => {
    const isEditableElement = (el: Element | null) => {
      if (!el) return false
      const tag = el.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
      if ((el as HTMLElement).isContentEditable) return true
      return false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return

      const active = document.activeElement
      if (isEditableElement(active)) return

      setSelectedChatId('')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setSelectedChatId])

  if (isLoadingProfile || !profile) {
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
        currentUser={profile}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        searchQuery={searchChatsQuery}
        setSearchQuery={setSearchChatsQuery}
        chatsQuery={chatsQuery}
        setChatsQuery={setChatsQuery}
      />

      <div className='relative z-10 flex flex-1 flex-col bg-slate-950/50 backdrop-blur-sm'>
        <ChatContainer
          isEmpty={isEmpty}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          chatId={selectedChatId}
          messages={messages}
          typingUsers={typingUsers}
          currentUser={profile}
          chatsQuery={chatsQuery}
          messagesQuery={messagesQuery}
          setMessagesQuery={setMessagesQuery}
          setSelectedChatId={setSelectedChatId}
          fetchNextPage={fetchNextPage}
          markAsRead={markAsRead}
          sendTyping={sendTyping}
          deleteMessage={deleteMessage}
          editMessage={editMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  )
}
