import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'

import { useSocket } from '../SocketProvider'

import {
  ChatFilter,
  CreateMessageDto,
  EnumMessageStatus,
  Message,
  MessageSenderDto,
  MessageStatusEvent,
  ReadReceiptEvent,
  TypingEvent
} from '@/types'

interface UseMessageSocketProps {
  currentUserId: string
  chatsQuery: ChatFilter
  chatId: string

  addMessageToCache: (message: Message) => void
  updateMessageInCache: (
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void
  removeMessageFromCache: (chatId: string, messageId: string) => void
  replaceTempMessage: (tempId: string, actualMessage: Message) => void

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
  currentUserId,
  chatsQuery,
  chatId,

  addMessageToCache,
  updateMessageInCache,
  removeMessageFromCache,
  replaceTempMessage,

  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  onTyping,
  onMessageStatus,
  onReadReceipt
}: UseMessageSocketProps) => {
  const { messageSocket, isMessageConnected } = useSocket()
  const queryClient = useQueryClient()
  const { updateChatInCache } = useGetChats(chatsQuery)

  // Таймауты для печатания
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const lastTypingEmitTime = useRef<Map<string, number>>(new Map())
  const typingThrottleTime = 3000

  // Отправка сообщения
  const sendMessage = useCallback(
    (
      data: CreateMessageDto,
      sender: MessageSenderDto,
      replyTo?: Message,
      forwardedFrom?: Message
    ) => {
      if (!messageSocket || !isMessageConnected) {
        toast.error('Нет подключения к серверу')
        return
      }

      const tempId = crypto.randomUUID()

      const optimisticMessage: Message = {
        id: tempId,
        chatId: data.chatId,
        sender,
        content: data.content,
        isSystem: false,
        replyTo: replyTo,
        forwardedFrom: forwardedFrom,
        statuses: { [sender.id]: EnumMessageStatus.SENT },
        createdAt: new Date().toString(),
        isEdited: false
      }

      addMessageToCache(optimisticMessage)

      if (replyTo) data.replyToId = replyTo.id
      if (forwardedFrom) data.forwardedFromId = forwardedFrom.id

      messageSocket.emit('message:send', {
        ...data,
        tempId
      })
    },
    [messageSocket, isMessageConnected, chatId, addMessageToCache]
  )

  // Редактирование сообщения
  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!messageSocket || !isMessageConnected) return

      messageSocket.emit('message:edit', {
        messageId,
        content
      })
    },
    [messageSocket, isMessageConnected]
  )

  // Удаление сообщения
  const deleteMessage = useCallback(
    (messageId: string, forEveryone: boolean = false) => {
      if (!messageSocket || !isMessageConnected) return

      messageSocket.emit('message:delete', {
        messageId,
        forEveryone
      })
    },
    [messageSocket, isMessageConnected]
  )

  // Индикатор печатания
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!messageSocket || !isMessageConnected) return

      const timeoutKey = `${chatId}`
      const now = Date.now()
      const lastEmitTime = lastTypingEmitTime.current.get(timeoutKey) || 0

      const emitTyping = () => {
        messageSocket.emit('typing', {
          chatId,
          isTyping
        })
        lastTypingEmitTime.current.set(timeoutKey, now)
      }

      if (isTyping) {
        if (now - lastEmitTime >= typingThrottleTime) {
          emitTyping()
        }

        if (typingTimeouts.current.has(timeoutKey)) {
          clearTimeout(typingTimeouts.current.get(timeoutKey))
        }

        const timeout = setTimeout(() => {
          messageSocket.emit('typing', {
            chatId,
            isTyping: false
          })
          typingTimeouts.current.delete(timeoutKey)
          lastTypingEmitTime.current.set(timeoutKey, Date.now())
        }, 5000)

        typingTimeouts.current.set(timeoutKey, timeout)
      } else {
        emitTyping()

        if (typingTimeouts.current.has(timeoutKey)) {
          clearTimeout(typingTimeouts.current.get(timeoutKey))
          typingTimeouts.current.delete(timeoutKey)
        }
      }
    },
    [messageSocket, isMessageConnected, chatId]
  )

  // Обновление статуса сообщения
  const updateMessageStatus = useCallback(
    (messageId: string, status: EnumMessageStatus) => {
      if (!messageSocket || !isMessageConnected) return

      messageSocket.emit('message:status', {
        messageId,
        status
      })
    },
    [messageSocket, isMessageConnected]
  )

  // Отметка о прочтении
  const markAsRead = useCallback(
    (messageIds?: string[]) => {
      if (!messageSocket || !isMessageConnected) return

      messageSocket.emit('messages:read', {
        chatId,
        messageIds
      })

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
    },
    [messageSocket, isMessageConnected, chatId]
  )

  useEffect(() => {
    if (!messageSocket || !isMessageConnected) return

    // Обработчик нового сообщения
    const handleNewMessage = (data: { message: Message; tempId?: string }) => {
      if (data.tempId && data.message.sender?.id === currentUserId) {
        replaceTempMessage(data.tempId, data.message)
      } else {
        addMessageToCache(data.message)
      }

      // updateChatInCache(data.message.chatId, {
      //   lastMessage: data.message
      // })
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })

      onNewMessage?.(data.message)
    }

    const handleMessageUpdated = (updatedMessage: Message) => {
      updateMessageInCache(
        updatedMessage.chatId,
        updatedMessage.id,
        updatedMessage
      )

      onMessageUpdated?.(updatedMessage)
    }

    // Обработчик удаления сообщения
    const handleMessageDeleted = (data: {
      chatId: string
      messageId: string
      forEveryone: boolean
      deletedBy: string
    }) => {
      // Удаляем сообщение из кэша
      removeMessageFromCache(chatId, data.messageId)

      onMessageDeleted?.(data)
    }

    // Обработчик печатания
    const handleTyping = (data: TypingEvent) => {
      onTyping?.(data)
    }

    // Обработчик статуса сообщения
    const handleMessageStatus = (data: MessageStatusEvent) => {
      updateMessageInCache(data.chatId, data.messageId, {
        statuses: {
          [data.userId]: data.status
        }
      })

      onMessageStatus?.(data)
    }

    // Обработчик прочтения
    const handleReadReceipt = (data: ReadReceiptEvent) => {
      if (data.chatId === chatId && data.messages) {
        data.messages.forEach(msg => {
          updateMessageInCache(data.chatId, msg.id, {
            statuses: {
              [msg.sender.id]: EnumMessageStatus.READ
            }
          })
        })
      }

      onReadReceipt?.(data)
    }

    // Подписка на события
    messageSocket.on('message:new', handleNewMessage)
    messageSocket.on('message:updated', handleMessageUpdated)
    messageSocket.on('message:deleted', handleMessageDeleted)
    messageSocket.on('typing', handleTyping)
    messageSocket.on('message:status:updated', handleMessageStatus)
    messageSocket.on('messages:read:updated', handleReadReceipt)

    return () => {
      // Отписка от событий
      messageSocket.off('message:new', handleNewMessage)
      messageSocket.off('message:updated', handleMessageUpdated)
      messageSocket.off('message:deleted', handleMessageDeleted)
      messageSocket.off('typing', handleTyping)
      messageSocket.off('message:status:updated', handleMessageStatus)
      messageSocket.off('messages:read:updated', handleReadReceipt)

      // Очистка таймаутов
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout))
      typingTimeouts.current.clear()
    }
  }, [
    messageSocket,
    isMessageConnected,
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
      isMessageConnected
    }),
    [
      sendMessage,
      editMessage,
      deleteMessage,
      sendTyping,
      updateMessageStatus,
      markAsRead,
      isMessageConnected
    ]
  )
}
