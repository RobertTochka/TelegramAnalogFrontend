import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'
import { useGetMessages } from '@/api/hooks/messages'

import { useSocket } from '../SocketProvider'

import {
  ChatParticipant,
  CreateMessageDto,
  EnumMessageStatus,
  Message,
  MessageStatusEvent,
  ReadReceiptEvent,
  TypingEvent
} from '@/types'

interface UseMessageSocketProps {
  chatId: string
  onNewMessage?: (message: Message) => void
  onMessageUpdated?: (message: Message) => void
  onMessageDeleted?: (data: {
    messageId: string
    forEveryone: boolean
    deletedBy: string
  }) => void
  onTyping?: (data: TypingEvent) => void
  onMessageStatus?: (data: MessageStatusEvent) => void
  onReadReceipt?: (data: ReadReceiptEvent) => void
}

export const useMessageSocket = ({
  chatId,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  onTyping,
  onMessageStatus,
  onReadReceipt
}: UseMessageSocketProps) => {
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const { addMessageToCache, updateMessageInCache, removeMessageFromCache } =
    useGetMessages(chatId, {})
  const { updateChatInCache } = useGetChats({})

  // Таймауты для печатания
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Отправка сообщения
  const sendMessage = useCallback(
    (data: CreateMessageDto) => {
      if (!socket || !isConnected) {
        toast.error('Нет подключения к серверу')
        return
      }

      socket.emit('message:send', {
        ...data
      })
    },
    [socket, isConnected, chatId]
  )

  // Редактирование сообщения
  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!socket || !isConnected) return

      socket.emit('message:edit', {
        messageId,
        content
      })
    },
    [socket, isConnected]
  )

  // Удаление сообщения
  const deleteMessage = useCallback(
    (messageId: string, forEveryone: boolean = false) => {
      if (!socket || !isConnected) return

      socket.emit('message:delete', {
        messageId,
        forEveryone
      })
    },
    [socket, isConnected]
  )

  // Индикатор печатания
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !isConnected) return

      socket.emit('typing', {
        chatId,
        isTyping
      })

      const timeoutKey = `${chatId}`

      if (isTyping) {
        if (typingTimeouts.current.has(timeoutKey)) {
          clearTimeout(typingTimeouts.current.get(timeoutKey))
        }

        const timeout = setTimeout(() => {
          socket.emit('typing', {
            chatId,
            isTyping: false
          })
          typingTimeouts.current.delete(timeoutKey)
        }, 5000)

        typingTimeouts.current.set(timeoutKey, timeout)
      } else {
        if (typingTimeouts.current.has(timeoutKey)) {
          clearTimeout(typingTimeouts.current.get(timeoutKey))
          typingTimeouts.current.delete(timeoutKey)
        }
      }
    },
    [socket, isConnected, chatId]
  )

  // Обновление статуса сообщения
  const updateMessageStatus = useCallback(
    (messageId: string, status: EnumMessageStatus) => {
      if (!socket || !isConnected) return

      socket.emit('message:status', {
        messageId,
        status
      })
    },
    [socket, isConnected]
  )

  // Отметка о прочтении
  const markAsRead = useCallback(
    (messageIds?: string[]) => {
      if (!socket || !isConnected) return

      socket.emit('messages:read', {
        chatId,
        messageIds
      })
    },
    [socket, isConnected, chatId]
  )

  useEffect(() => {
    if (!socket || !isConnected || !chatId) return

    // Обработчик нового сообщения
    const handleNewMessage = (data: { message: Message; tempId?: string }) => {
      addMessageToCache(data.message)

      updateChatInCache(chatId, {
        lastMessage: data.message
      })

      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] })

      onNewMessage?.(data.message)
    }

    const handleMessageUpdated = (updatedMessage: Message) => {
      updateMessageInCache(updatedMessage.id, updatedMessage)

      onMessageUpdated?.(updatedMessage)
    }

    // Обработчик удаления сообщения
    const handleMessageDeleted = (data: {
      messageId: string
      forEveryone: boolean
      deletedBy: string
    }) => {
      // Удаляем сообщение из кэша
      removeMessageFromCache(data.messageId)

      onMessageDeleted?.(data)
    }

    // Обработчик печатания
    const handleTyping = (data: TypingEvent) => {
      onTyping?.(data)
    }

    // Обработчик статуса сообщения
    const handleMessageStatus = (data: MessageStatusEvent) => {
      updateMessageInCache(data.messageId, {
        statuses: {
          [data.userId]: data.status
        }
      })

      onMessageStatus?.(data)
    }

    // Обработчик прочтения
    const handleReadReceipt = (data: ReadReceiptEvent) => {
      if (data.chatId === chatId && data.messageIds) {
        data.messageIds.forEach(messageId => {
          updateMessageInCache(messageId, {
            statuses: {
              [data.userId]: EnumMessageStatus.READ
            }
          })
        })

        queryClient.setQueryData(['chats', 'list', chatId], (old: any) => {
          if (!old) return old
          const updatedParticipants = old.participants?.map(
            (p: ChatParticipant) =>
              p.id === data.userId ? { ...p, lastReadAt: data.readAt } : p
          )
          return { ...old, participants: updatedParticipants }
        })
      }

      onReadReceipt?.(data)
    }

    // Подписка на события
    socket.on('message:new', handleNewMessage)
    socket.on('message:updated', handleMessageUpdated)
    socket.on('message:deleted', handleMessageDeleted)
    socket.on('typing', handleTyping)
    socket.on('message:status:updated', handleMessageStatus)
    socket.on('messages:read', handleReadReceipt)

    return () => {
      // Отписка от событий
      socket.off('message:new', handleNewMessage)
      socket.off('message:updated', handleMessageUpdated)
      socket.off('message:deleted', handleMessageDeleted)
      socket.off('typing', handleTyping)
      socket.off('message:status:updated', handleMessageStatus)
      socket.off('messages:read', handleReadReceipt)

      // Очистка таймаутов
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout))
      typingTimeouts.current.clear()
    }
  }, [
    socket,
    isConnected,
    chatId,
    queryClient,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onTyping,
    onMessageStatus,
    onReadReceipt
  ])

  return useMemo(
    () => ({
      sendMessage,
      editMessage,
      deleteMessage,
      sendTyping,
      updateMessageStatus,
      markAsRead,
      isConnected
    }),
    [
      sendMessage,
      editMessage,
      deleteMessage,
      sendTyping,
      updateMessageStatus,
      markAsRead,
      isConnected
    ]
  )
}
