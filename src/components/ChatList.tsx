'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useGetChats } from '@/api/hooks/chat/use-get-chats'

import { ChatFilter, EnumChatType } from '@/types'

export const ChatList = () => {
  const [filters, setFilters] = useState<ChatFilter>({
    limit: 20,
    type: EnumChatType.DIRECT
  })

  const {
    chats,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    total,
    isEmpty,
    updateChatInCache
  } = useGetChats(filters)

  // Intersection Observer для бесконечной загрузки
  //   const observerRef = useRef<IntersectionObserver>(
  //     new IntersectionObserver(entries => {
  //       if (entries[0].isIntersecting && hasNextPage) {
  //         fetchNextPage()
  //       }
  //     })
  //   )
  //   const lastChatRef = useCallback(
  //     (node: HTMLDivElement) => {
  //       if (isLoading || isFetchingNextPage) return

  //       if (observerRef.current) {
  //         observerRef.current.disconnect()
  //       }

  //       observerRef.current = new IntersectionObserver(entries => {
  //         if (entries[0].isIntersecting && hasNextPage) {
  //           fetchNextPage()
  //         }
  //       })

  //       if (node) {
  //         observerRef.current.observe(node)
  //       }
  //     },
  //     [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  //   )

  // Обновление чата при получении нового сообщения
  useEffect(() => {
    const handleNewMessage = (event: any) => {
      const { chatId, message } = event
      updateChatInCache(chatId, {
        lastMessage: message,
        updatedAt: new Date().toISOString()
      })
    }
  }, [updateChatInCache])

  if (isLoading) {
    return <div>Загрузка</div>
  }

  if (error) {
    return <div>Ошибка</div>
  }

  if (isEmpty) {
    return <div>Пусто</div>
  }

  return (
    <div className='space-y-2'>
      {/* Заголовок с количеством чатов */}
      <div className='px-4 py-2 text-sm text-gray-500'>
        Всего чатов: {total}
      </div>

      {/* Список чатов */}
      {chats.map((chat, index) => (
        <div>
          {index}: {chat.name}
        </div>
      ))}

      {/* Индикатор загрузки */}
      {isFetchingNextPage && (
        <div className='py-4 text-center'>Loading....</div>
      )}

      {/* Сообщение о конце списка */}
      {!hasNextPage && chats.length > 0 && (
        <div className='py-4 text-center text-gray-500'>Все чаты загружены</div>
      )}
    </div>
  )
}
