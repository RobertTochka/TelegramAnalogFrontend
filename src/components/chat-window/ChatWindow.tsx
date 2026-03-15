'use client'

import { Loader2, MessageCircle } from 'lucide-react'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react'

import { MessageItem } from './message/MessageItem'
import { Message, Profile } from '@/types'

interface ChatWindowProps {
  chatId: string
  currentUser: Profile
  typingUsers: Set<string>
  messages: Message[]
  isEmpty: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  setEditing: Dispatch<SetStateAction<boolean>>
  setEditedText: Dispatch<SetStateAction<string>>
  setEditingId: Dispatch<SetStateAction<string>>
  deleteMessage: (messageId: string, forEveryone?: boolean) => void
  setReplyTo: Dispatch<SetStateAction<Message | undefined>>
  setForwardedFrom: Dispatch<SetStateAction<Message | undefined>>
}

export const ChatWindow = ({
  chatId,
  currentUser,
  typingUsers,
  messages,
  isEmpty,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setEditing,
  setEditedText,
  setEditingId,
  deleteMessage,
  setReplyTo,
  setForwardedFrom
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef<number>(0)
  const isInitialLoad = useRef(true)

  useLayoutEffect(() => {
    prevScrollHeightRef.current = 0
    isInitialLoad.current = true

    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      isInitialLoad.current = false
    }
  }, [chatId])

  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView()
      isInitialLoad.current = false
    }
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } =
        messagesContainerRef.current
      const isNearBottom = scrollHeight - clientHeight - scrollTop < 100

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  useEffect(() => {
    if (
      !isFetchingNextPage &&
      prevScrollHeightRef.current &&
      messagesContainerRef.current
    ) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current

      messagesContainerRef.current.scrollTop = scrollDiff
      prevScrollHeightRef.current = 0
    }
  }, [messages, isFetchingNextPage])

  useLayoutEffect(() => {
    if (!prevScrollHeightRef.current || !messagesContainerRef.current) return

    const el = messagesContainerRef.current
    const newHeight = el.scrollHeight

    el.scrollTop = newHeight - prevScrollHeightRef.current
    prevScrollHeightRef.current = 0
  }, [messages])

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current

    if (!el) return

    if (el.scrollTop < 100 && hasNextPage) {
      prevScrollHeightRef.current = el.scrollHeight

      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div
      className='custom-scrollbar flex-1 overflow-y-auto px-4'
      onScroll={handleScroll}
      ref={messagesContainerRef}
    >
      <div className='space-y-4 px-6 py-4'>
        {isFetchingNextPage && (
          <div className='flex justify-center py-2'>
            <Loader2 className='h-5 w-5 animate-spin text-purple-500' />
          </div>
        )}

        {!isEmpty ? (
          messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUser.id}
              showAvatar={
                index === 0 ||
                messages[index - 1]?.sender?.id !== message.sender?.id
              }
              setEditing={setEditing}
              setEditedText={setEditedText}
              setEditingId={setEditingId}
              deleteMessage={deleteMessage}
              containerRef={messagesContainerRef}
              setReplyTo={setReplyTo}
              setForwardedFrom={setForwardedFrom}
            />
          ))
        ) : (
          <div className='mt-10 flex h-full flex-col items-center justify-center text-center'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
              <div className='relative rounded-full bg-linear-to-r from-purple-600 to-blue-600 p-4'>
                <MessageCircle className='h-12 w-12 text-white' />
              </div>
            </div>
            <h3 className='mb-2 text-xl font-semibold text-white'>
              Начните общение, написав первое сообщение
            </h3>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
