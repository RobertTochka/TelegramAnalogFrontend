'use client'

import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react'

import { useGetOneChat } from '@/api/hooks/chat'

import { ChatHeader } from './ChatHeader'
import { ChatWindow } from './ChatWindow'
import { FileItem } from './FileItem'
import { InputForm } from './InputForm'
import { ForwardDialog } from './message/ForwardDialog'
import { ReplyBanner } from './message/ReplyBanner'
import {
  ChatFilter,
  CreateMessageDto,
  EnumMessageStatus,
  Message,
  MessageFilter,
  MessageSenderDto,
  Profile
} from '@/types'

interface ChatContainerProps {
  isEmpty: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  isLoading: boolean
  chatId: string
  messages: Message[]
  typingUsers: Set<string>
  currentUser: Profile
  chatsQuery: ChatFilter
  messagesQuery: Omit<MessageFilter, 'page'>
  setMessagesQuery: Dispatch<SetStateAction<Omit<MessageFilter, 'page'>>>
  setSelectedChatId: Dispatch<SetStateAction<string>>
  fetchNextPage: () => void
  markAsRead: (messageIds?: string[] | undefined) => void
  sendTyping: (isTyping: boolean) => void
  deleteMessage: (messageId: string, forEveryone?: boolean) => void
  editMessage: (messageId: string, content: string) => void
  sendMessage: (
    data: CreateMessageDto,
    sender: MessageSenderDto,
    replyTo?: Message,
    forwardedFrom?: Message
  ) => void
}

export const ChatContainer: FC<ChatContainerProps> = ({
  isEmpty,
  isFetchingNextPage,
  hasNextPage,
  isLoading,
  chatId,
  messages,
  typingUsers,
  currentUser,
  chatsQuery,
  messagesQuery,
  setMessagesQuery,
  setSelectedChatId,
  fetchNextPage,
  markAsRead,
  sendTyping,
  deleteMessage,
  editMessage,
  sendMessage
}) => {
  const searchParams = useSearchParams()
  const [messageText, setMessageText] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [replyTo, setReplyTo] = useState<Message | undefined>(undefined)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [forwardedFrom, setForwardedFrom] = useState<Message | undefined>(
    undefined
  )

  const { chat, isLoadingChat } = useGetOneChat(chatId)

  const filteredMessages = useMemo(() => {
    if (!messagesQuery.search) return messages

    return messages.filter(message => {
      return message.content
        ?.toLowerCase()
        .includes(messagesQuery.search!.toLowerCase())
    })
  }, [messages, messagesQuery.search])

  useEffect(() => {
    const chatIdFromQuery = searchParams.get('chatId')

    if (chatIdFromQuery) {
      setSelectedChatId(chatIdFromQuery)

      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    if (chatId && messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => msg.sender!.id !== currentUser.id)
        .filter(
          msg => msg.statuses?.[currentUser.id] !== EnumMessageStatus.READ
        )
        .map(msg => msg.id)

      markAsRead(unreadMessages)
    }
  }, [chatId, messages, currentUser.id, markAsRead])

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

  const isInitialLoading =
    (!chat && isLoadingChat) || (messages.length === 0 && isLoading)

  if (isInitialLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='relative'>
          <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
          <Loader2 className='relative h-8 w-8 animate-spin text-purple-500' />
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='relative'>Такого чата не существует</div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <ChatHeader
        currentUser={currentUser}
        typingUsers={typingUsers}
        chat={chat}
        participant={chat.participants?.find(p => p.id !== currentUser.id)!}
        onBack={() => setSelectedChatId('')}
        messagesQuery={messagesQuery}
        setMessagesQuery={setMessagesQuery}
        isInfoModalOpen={isInfoModalOpen}
        setIsInfoModalOpen={setIsInfoModalOpen}
      />

      <ChatWindow
        chatId={chatId}
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
