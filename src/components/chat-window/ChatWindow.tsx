'use client'

import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { ScrollArea } from '@/components/ui'

import { MessageItem } from './MessageItem'
import { Message } from '@/types'

interface ChatWindowProps {
  currentUserId: string
  typingUsers: Set<string>
  all: Message[]
  isEmpty: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export const ChatWindow = ({
  currentUserId,
  typingUsers,
  all,
  isEmpty,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [all])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      if (target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        const scrollHeight = target.scrollHeight
        fetchNextPage()
        target.scrollTop = target.scrollHeight - scrollHeight
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  return (
    <ScrollArea
      className='flex-1 px-4'
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
              message={message}
              currentUserId={currentUserId}
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
    </ScrollArea>
  )
}
