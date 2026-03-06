'use client'

import { Loader2 } from 'lucide-react'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'

import { useGetOneChat } from '@/api/hooks/chat'
import { useGetMessages } from '@/api/hooks/messages'

import { ChatHeader } from './ChatHeader'
import { ChatWindow } from './ChatWindow'
import { FileItem } from './FileItem'
import { InputForm } from './InputForm'
import {
  ChatFilter,
  EnumMessageStatus,
  Message,
  MessageFilter,
  Profile
} from '@/types'
import { useMessageSocket } from '@/web-socket/hooks'

interface ChatContainerProps {
  chatId: string
  currentUser: Profile
  setSelectedChatId: Dispatch<SetStateAction<string>>
  chatsQuery: ChatFilter
}

export const ChatContainer: FC<ChatContainerProps> = ({
  chatId,
  currentUser,
  setSelectedChatId,
  chatsQuery
}) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [searchMessagesQuery, setSearchMessagesQuery] = useState('')
  const [messagesQuery, setMessagesQuery] = useState<
    Omit<MessageFilter, 'page'>
  >({
    limit: 20,
    search: searchMessagesQuery || undefined
  })

  const { chat, isLoadingChat } = useGetOneChat(chatId)

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isEmpty
  } = useGetMessages(chatId, messagesQuery)

  const { sendMessage, sendTyping, markAsRead } = useMessageSocket({
    messagesQuery,
    chatsQuery,
    chatId,
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
    if (chatId && messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => msg.sender!.id !== currentUser.id)
        .filter(
          msg => msg.statuses?.[currentUser.id] !== EnumMessageStatus.READ
        )
        .map(msg => msg.id)

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages)
      }
    }
  }, [chatId, messages, currentUser.id, markAsRead])

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (isLoading || isLoadingChat) {
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
    <div className='flex h-full flex-col'>
      <ChatHeader
        typingUsers={typingUsers}
        participant={chat?.participants.find(p => p.id !== currentUser.id)!}
        onBack={() => setSelectedChatId('')}
      />

      <ChatWindow
        currentUser={currentUser}
        typingUsers={typingUsers}
        all={messages}
        isEmpty={isEmpty}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />

      {/* Прикрепленные файлы */}
      {attachedFiles.length > 0 && (
        <div className='border-t border-white/5 bg-slate-900/50 p-2 backdrop-blur-sm'>
          <div className='flex flex-wrap gap-2'>
            {attachedFiles.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                removeFile={() => removeFile(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Форма отправки */}
      <InputForm
        chatId={chatId}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
        sendMessage={sendMessage}
        sendTyping={sendTyping}
        currentUser={currentUser}
      />
    </div>
  )
}
