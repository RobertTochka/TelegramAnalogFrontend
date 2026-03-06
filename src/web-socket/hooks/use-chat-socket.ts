import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'

import { useSocket } from '../SocketProvider'

import { Chat, ChatFilter } from '@/types'

interface UseChatSocketProps {
  chatsQuery: ChatFilter
  onNewChat?: (data: { chatId: string; chat: Chat; message: string }) => void
  onChatDeleted?: (data: {
    chatId: string
    deletedBy: string
    message: string
  }) => void
  onChatAdded?: (data: {
    chatId: string
    chat: Chat
    addedBy: string
    message: string
  }) => void
  onChatRemoved?: (data: {
    chatId: string
    removedBy: string
    message: string
  }) => void
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
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()
  const { addChatToCache, updateChatParticipantsInCache, removeChatFromCache } =
    useGetChats(chatsQuery)

  // Создание чата
  const createChat = useCallback(
    (data: { participantIds: string[]; type?: string; name?: string }) => {
      if (!socket || !isConnected) {
        toast.error('Нет подключения к серверу')
        return
      }

      socket.emit('chat:create', data)
    },
    [socket, isConnected]
  )

  // Удаление чата
  const deleteChat = useCallback(
    (chatId: string) => {
      if (!socket || !isConnected) return

      socket.emit('chat:delete', { chatId })
    },
    [socket, isConnected]
  )

  // Добавление участников
  const addParticipants = useCallback(
    (chatId: string, participantIds: string[]) => {
      if (!socket || !isConnected) return

      socket.emit('chat:participants:add', {
        chatId,
        participantIds
      })
    },
    [socket, isConnected]
  )

  // Удаление участников
  const removeParticipants = useCallback(
    (chatId: string, participantIds: string[]) => {
      if (!socket || !isConnected) return

      socket.emit('chat:participants:remove', {
        chatId,
        participantIds
      })
    },
    [socket, isConnected]
  )

  // Присоединение к чату по ссылке
  const joinChat = useCallback(
    (chatId: string) => {
      if (!socket || !isConnected) return

      socket.emit('chat:join', { chatId })
    },
    [socket, isConnected]
  )

  // Выход из чата
  const leaveChat = useCallback(
    (chatId: string) => {
      if (!socket || !isConnected) return

      socket.emit('chat:leave', { chatId })
    },
    [socket, isConnected]
  )

  useEffect(() => {
    if (!socket || !isConnected) return

    // Обработчик нового чата
    const handleNewChat = (data: {
      chatId: string
      chat: Chat
      message: string
    }) => {
      addChatToCache(data.chat)

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })

      onNewChat?.(data)
    }

    const handleChatDeleted = (data: {
      chatId: string
      deletedBy: string
      message: string
    }) => {
      removeChatFromCache(data.chatId)

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      queryClient.removeQueries({ queryKey: ['chats', data.chatId] })
      queryClient.removeQueries({ queryKey: ['messages', data.chatId] })

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

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })

      onChatAdded?.(data)
    }

    // Обработчик удаления из чата
    const handleChatRemoved = (data: {
      chatId: string
      removedBy: string
      message: string
    }) => {
      removeChatFromCache(data.chatId)

      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] })
      queryClient.removeQueries({ queryKey: ['chats', data.chatId] })
      queryClient.removeQueries({ queryKey: ['messages', data.chatId] })

      onChatRemoved?.(data)
    }

    // Обработчик присоединения участника
    const handleParticipantJoined = (data: {
      chatId: string
      userId: string
      message: string
    }) => {
      updateChatParticipantsInChache(data.chatId, data.userId, false)

      onParticipantJoined?.(data)
    }

    // Обработчик выхода участника
    const handleParticipantLeft = (data: {
      chatId: string
      userId: string
      message: string
    }) => {
      updateChatParticipantsInChache(data.chatId, data.userId, true)

      onParticipantLeft?.(data)
    }

    // Подписка на события
    socket.on('chat:new', handleNewChat)
    socket.on('chat:deleted', handleChatDeleted)
    socket.on('chat:added', handleChatAdded)
    socket.on('chat:removed', handleChatRemoved)
    socket.on('chat:participant:joined', handleParticipantJoined)
    socket.on('chat:participant:left', handleParticipantLeft)

    return () => {
      // Отписка от событий
      socket.off('chat:new', handleNewChat)
      socket.off('chat:deleted', handleChatDeleted)
      socket.off('chat:added', handleChatAdded)
      socket.off('chat:removed', handleChatRemoved)
      socket.off('chat:participant:joined', handleParticipantJoined)
      socket.off('chat:participant:left', handleParticipantLeft)
    }
  }, [
    socket,
    isConnected,
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
      isConnected
    }),
    [
      createChat,
      deleteChat,
      addParticipants,
      removeParticipants,
      joinChat,
      leaveChat,
      isConnected
    ]
  )
}
