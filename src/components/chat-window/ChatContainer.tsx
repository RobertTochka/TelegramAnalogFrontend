'use client'

import { Loader2 } from 'lucide-react'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'

import { useGetOneChat } from '@/api/hooks/chat'
import { useGetMessages } from '@/api/hooks/messages'

import { ChatHeader } from './ChatHeader'
import { ChatWindow } from './ChatWindow'
import { FileItem } from './FileItem'
import { InputForm } from './InputForm'
import { ForwardDialog } from './message/ForwardDialog'
import { ReplyBanner } from './message/ReplyBanner'
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
  const [messageText, setMessageText] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [replyTo, setReplyTo] = useState<Message | undefined>(undefined)
  const [forwardedFrom, setForwardedFrom] = useState<Message | undefined>(
    undefined
  )
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [messagesQuery, setMessagesQuery] = useState<
    Omit<MessageFilter, 'page'>
  >({
    limit: 40
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

  const { sendMessage, editMessage, deleteMessage, sendTyping, markAsRead } =
    useMessageSocket({
      currentUserId: currentUser.id,
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

  useEffect(() => {
    const search = messagesQuery.search
    if (search) {
      const filtered = messages.filter(message => {
        return message.content?.toLowerCase().includes(search.toLowerCase())
      })
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages(messages)
    }
  }, [messages, messagesQuery.search])

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = (
    forwardedFrom?: Message,
    forwardContent?: string
  ) => {
    if (!messageText.trim() && attachedFiles.length === 0 && !forwardedFrom)
      return

    // Здесь будет логика отправки сообщения с файлами
    sendMessage(
      { chatId, content: forwardedFrom ? forwardContent : messageText },
      {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar
      },
      replyTo,
      forwardedFrom
    )

    setMessageText('')
    setAttachedFiles([])
    setReplyTo(undefined)
    sendTyping(false)
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
        messagesQuery={messagesQuery}
        setMessagesQuery={setMessagesQuery}
      />

      <ChatWindow
        currentUser={currentUser}
        typingUsers={typingUsers}
        messages={filteredMessages}
        isEmpty={isEmpty}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        setEditing={setEditing}
        setEditedText={setEditedText}
        setEditingId={setEditingId}
        deleteMessage={deleteMessage}
        setReplyTo={setReplyTo}
        setForwardedFrom={setForwardedFrom}
      />

      {replyTo && (
        <ReplyBanner
          replyTo={replyTo}
          onCancel={() => setReplyTo(undefined)}
        />
      )}

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
        messageText={messageText}
        setMessageText={setMessageText}
        onSend={handleSendMessage}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
        editMessage={editMessage}
        sendTyping={sendTyping}
        editing={editing}
        editedText={editedText}
        setEditedText={setEditedText}
        setEditing={setEditing}
        editingId={editingId}
      />

      {forwardedFrom && (
        <ForwardDialog
          open={!!forwardedFrom}
          onOpenChange={() => setForwardedFrom(undefined)}
          message={forwardedFrom}
          currentUserId={currentUser.id}
          onForward={handleSendMessage}
        />
      )}
    </div>
  )
}
