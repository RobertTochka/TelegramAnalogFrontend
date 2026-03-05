'use client'

import { Loader2 } from 'lucide-react'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'

import { useGetOneChat } from '@/api/hooks/chat'
import { useGetMessages } from '@/api/hooks/messages'

import { ChatHeader } from './ChatHeader'
import { ChatWindow } from './ChatWindow'
import { FileItem } from './FileItem'
import { InputForm } from './InputForm'
import { Message } from '@/types'
import { useMessageSocket } from '@/web-socket/hooks'

interface ChatContainerProps {
  chatId: string
  currentUserId: string
  setSelectedChatId: Dispatch<SetStateAction<string>>
}

export const ChatContainer: FC<ChatContainerProps> = ({
  chatId,
  currentUserId,
  setSelectedChatId
}) => {
  const [all, setAll] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const { chat, isLoadingChat } = useGetOneChat(chatId)

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isEmpty
  } = useGetMessages(chatId, { limit: 50 })

  const { sendMessage, sendTyping, markAsRead } = useMessageSocket({
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
    },
    onNewMessage: msg => {
      setAll(prev => [...prev, msg])
    }
  })

  useEffect(() => {
    setAll(messages)
    if (chatId && messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => msg.sender!.id !== currentUserId)
        .filter(msg => msg.statuses?.[currentUserId] !== 'READ')
        .map(msg => msg.id)

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages)
      }
    }
  }, [chatId, messages, currentUserId, markAsRead])

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
        participant={chat?.participants.find(p => p.id !== currentUserId)!}
        onBack={() => setSelectedChatId('')}
      />

      <ChatWindow
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        all={all}
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
      />
    </div>
  )
}
