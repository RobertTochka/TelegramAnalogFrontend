import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'
import { useGetProfile } from '@/api/hooks/users'

import { useSocket } from '../SocketProvider'

import { Chat, ChatFilter } from '@/types'

interface UseChatSocketProps {
  chatsQuery: ChatFilter
  onNewChat?: (data: { chatId: string; chat: Chat; message: string }) => void
  onChatDeleted?: (data: { chatId: string; message: string }) => void
  onChatAdded?: (data: { chatId: string; chat: Chat; message: string }) => void
  onChatRemoved?: (data: { chatId: string; message: string }) => void
  onParticipantJoined?: (data: {
    chatId: string
    userId: string
    message: string
  }) => void
  onParticipantLeft?: (data: {
    chatId: string
    userId: string
    message: string
  }) => void
}

export const useChatSocket = ({
  chatsQuery,
  onNewChat,
  onChatDeleted,
  onChatAdded,
  onChatRemoved,
  onParticipantJoined,
  onParticipantLeft
}: UseChatSocketProps) => {
  const { chatSocket, isChatConnected } = useSocket()
  const queryClient = useQueryClient()
  const { addChatToCache, updateChatParticipantsInCache, removeChatFromCache } =
    useGetChats(chatsQuery)
  // TODO: убрать заглушку
  const { profile } = useGetProfile()

  // Создание чата
  const createChat = useCallback(
    (data: { participantIds: string[]; type?: string; name?: string }) => {
      if (!chatSocket || !isChatConnected) {
        toast.error('Нет подключения к серверу')
        return
      }

      chatSocket.emit('chat:create', data)
    },
    [chatSocket, isChatConnected]
  )

  // Удаление чата
  const deleteChat = useCallback(
    (chatId: string) => {
      if (!chatSocket || !isChatConnected) return

      chatSocket.emit('chat:delete', { chatId })
    },
    [chatSocket, isChatConnected]
  )

  // Добавление участников
  const addParticipants = useCallback(
    (chatId: string, participantIds: string[]) => {
      if (!chatSocket || !isChatConnected) return

      chatSocket.emit('chat:participants:add', {
        chatId,
        participantIds
      })

      updateChatParticipantsInCache(chatId, profile?.id!, false)
    },
    [chatSocket, isChatConnected]
  )

  // Удаление участников
  const removeParticipants = useCallback(
    (chatId: string, participantIds: string[]) => {
      if (!chatSocket || !isChatConnected) return

      chatSocket.emit('chat:participants:remove', {
        chatId,
        participantIds
      })

      updateChatParticipantsInCache(chatId, profile?.id!, true)
    },
    [chatSocket, isChatConnected]
  )

  // Присоединение к чату по ссылке
  const joinChat = useCallback(
    (chatId: string) => {
      if (!chatSocket || !isChatConnected) return

      chatSocket.emit('chat:join', { chatId })
    },
    [chatSocket, isChatConnected]
  )

  // Выход из чата
  const leaveChat = useCallback(
    (chatId: string) => {
      if (!chatSocket || !isChatConnected) return

      chatSocket.emit('chat:leave', { chatId })
    },
    [chatSocket, isChatConnected]
  )

  useEffect(() => {
    if (!chatSocket || !isChatConnected) return

    // Обработчик нового чата
    const handleNewChat = (data: {
      chatId: string
      chat: Chat
      message: string
    }) => {
      addChatToCache(data.chat)

      onNewChat?.(data)
    }

    const handleChatDeleted = (data: {
      chatId: string
      chat: Chat
      message: string
    }) => {
      removeChatFromCache(data.chatId)

      onChatDeleted?.(data)
    }

    // Обработчик добавления в чат
    const handleChatAdded = (data: {
      chatId: string
      chat: Chat
      addedBy: string
      message: string
    }) => {
      addChatToCache(data.chat)

      onChatAdded?.(data)
    }

    // Обработчик удаления из чата
    const handleChatRemoved = (data: {
      chatId: string
      removedBy: string
      message: string
    }) => {
      removeChatFromCache(data.chatId)

      onChatRemoved?.(data)
    }

    // Обработчик присоединения участника
    const handleParticipantJoined = (data: {
      chatId: string
      userId: string
      message: string
    }) => {
      updateChatParticipantsInCache(data.chatId, data.userId, false)

      onParticipantJoined?.(data)
    }

    // Обработчик выхода участника
    const handleParticipantLeft = (data: {
      chatId: string
      userId: string
      message: string
    }) => {
      updateChatParticipantsInCache(data.chatId, data.userId, true)

      onParticipantLeft?.(data)
    }

    // Подписка на события
    chatSocket.on('chat:new', handleNewChat)
    chatSocket.on('chat:deleted', handleChatDeleted)
    chatSocket.on('chat:added', handleChatAdded)
    chatSocket.on('chat:removed', handleChatRemoved)
    chatSocket.on('chat:participant:joined', handleParticipantJoined)
    chatSocket.on('chat:participant:left', handleParticipantLeft)

    return () => {
      // Отписка от событий
      chatSocket.off('chat:new', handleNewChat)
      chatSocket.off('chat:deleted', handleChatDeleted)
      chatSocket.off('chat:added', handleChatAdded)
      chatSocket.off('chat:removed', handleChatRemoved)
      chatSocket.off('chat:participant:joined', handleParticipantJoined)
      chatSocket.off('chat:participant:left', handleParticipantLeft)
    }
  }, [
    chatSocket,
    isChatConnected,
    queryClient,
    onNewChat,
    onChatDeleted,
    onChatAdded,
    onChatRemoved,
    onParticipantJoined,
    onParticipantLeft
  ])

  return useMemo(
    () => ({
      createChat,
      deleteChat,
      addParticipants,
      removeParticipants,
      joinChat,
      leaveChat,
      isChatConnected
    }),
    [
      createChat,
      deleteChat,
      addParticipants,
      removeParticipants,
      joinChat,
      leaveChat,
      isChatConnected
    ]
  )
}
