'use client'

import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { ScrollArea } from '@/components/ui'

import { MessageItem } from './MessageItem'
import { Message, Profile } from '@/types'

interface ChatWindowProps {
  currentUser: Profile
  typingUsers: Set<string>
  all: Message[]
  isEmpty: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export const ChatWindow = ({
  currentUser,
  typingUsers,
  all,
  isEmpty,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef<number>(0)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (isInitialLoad.current && all.length > 0) {
      messagesEndRef.current?.scrollIntoView()
      isInitialLoad.current = false
    }
  }, [all])

  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } =
        messagesContainerRef.current
      const isNearBottom = scrollHeight - clientHeight - scrollTop < 100

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [all])

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
  }, [all, isFetchingNextPage])

  useLayoutEffect(() => {
    if (!prevScrollHeightRef.current || !messagesContainerRef.current) return

    const el = messagesContainerRef.current
    const newHeight = el.scrollHeight

    el.scrollTop = newHeight - prevScrollHeightRef.current
    prevScrollHeightRef.current = 0
  }, [all])

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
      className='flex-1 overflow-y-auto px-4'
      onScroll={handleScroll}
      ref={messagesContainerRef}
    >
      <div className='space-y-4 px-6 py-4'>
        {isFetchingNextPage && (
          <div className='flex justify-center py-2'>
            <Loader2 className='h-5 w-5 animate-spin text-purple-500' />
          </div>
        )}

        {!isEmpty &&
          all.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUser.id}
              showAvatar={
                index === 0 || all[index - 1]?.sender?.id !== message.sender?.id
              }
            />
          ))}

        {/* Индикаторы печатания */}
        {Array.from(typingUsers).map(userId => (
          <div
            key={userId}
            className='flex items-center gap-2 text-sm text-gray-400'
          >
            <div className='flex items-center gap-1 rounded-full bg-slate-800 px-4 py-2'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-purple-500' />
              <span>Печатает</span>
              <span className='flex gap-0.5'>
                <span className='animate-bounce'>.</span>
                <span className='animate-bounce delay-100'>.</span>
                <span className='animate-bounce delay-200'>.</span>
              </span>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
