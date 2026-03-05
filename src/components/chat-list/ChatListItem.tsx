import { BellOff, Pin, Users } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/components/ui'

import { getInitials } from '@/utils/functions'

import { Chat, EnumChatType } from '@/types'

interface ChatListItemProps {
  chat: Chat
  selectedChatId: string
  currentUserId: string
  onSelectChat?: (chatId: string) => void
}

export const ChatListItem = ({
  chat,
  selectedChatId,
  currentUserId,
  onSelectChat
}: ChatListItemProps) => {
  const getChatName = () => {
    if (chat.type === EnumChatType.DIRECT) {
      const otherParticipant = chat.participants?.find(
        p => p.id !== currentUserId
      )
      return (
        otherParticipant?.firstName ||
        otherParticipant?.username ||
        'Пользователь'
      )
    }
    return chat.name || 'Групповой чат'
  }

  const getChatAvatar = () => {
    if (chat.type !== EnumChatType.DIRECT && chat.avatar) return chat.avatar

    const otherParticipant = chat.participants?.find(
      p => p.id !== currentUserId
    )

    return otherParticipant?.avatar
  }

  const formatLastMessage = (msg: string) => {
    if (msg.length > 30) return msg.substring(0, 27) + '...'
    return msg
  }

  const getLastMessage = () => {
    if (chat.lastMessage) {
      const sender =
        chat.lastMessage.sender?.id === currentUserId
          ? 'Вы: '
          : chat.lastMessage.sender?.firstName
            ? `${chat.lastMessage.sender.firstName}: `
            : ''
      const text = formatLastMessage(chat.lastMessage.content) || '📎 Медиа'
      return sender + text
    }
    return 'Нет сообщений'
  }

  const getLastMessageTime = () => {
    if (chat.lastMessage?.createdAt) {
      try {
        return new Date(chat.lastMessage.createdAt).toLocaleTimeString(
          'ru-RU',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
      } catch {
        return ''
      }
    }
    return ''
  }

  const handleSelectChat = (chatId: string) => {
    onSelectChat?.(chatId)
  }

  return (
    <button
      key={chat.id}
      onClick={() => handleSelectChat(chat.id)}
      className={`relative w-full overflow-hidden transition-all duration-200 before:absolute before:inset-0 before:bg-linear-to-r before:from-purple-600/0 before:to-blue-600/0 before:opacity-0 before:transition-opacity hover:before:opacity-10 ${
        selectedChatId === chat.id
          ? 'bg-linear-to-r from-purple-600/20 to-blue-600/20 before:opacity-20'
          : 'hover:bg-slate-800/50'
      } `}
    >
      <div className='relative flex items-start space-x-3 p-4'>
        {/* Аватар */}
        <Avatar className='h-10 w-10 ring-2 ring-white/10'>
          <AvatarImage src={getChatAvatar()} />
          <AvatarFallback className='bg-linear-to-r from-purple-600 to-blue-600 text-sm text-white'>
            {getInitials(getChatName())}
          </AvatarFallback>
        </Avatar>

        {/* Информация о чате */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline justify-between'>
            <h3 className='truncate text-sm font-medium text-white'>
              {getChatName()}
            </h3>
            <span className='ml-2 shrink-0 text-xs text-gray-500'>
              {getLastMessageTime()}
            </span>
          </div>

          <div className='mt-0.5 flex items-center gap-1'>
            <div className='flex items-center gap-1 text-gray-500'>
              {chat.type === EnumChatType.GROUP && (
                <Users className='h-3 w-3' />
              )}
              {chat.isMuted && <BellOff className='h-3 w-3' />}
              {chat.isPinned && <Pin className='h-3 w-3' />}
            </div>

            <p className='truncate text-xs text-gray-400'>{getLastMessage()}</p>
          </div>
        </div>

        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className='absolute right-2 bottom-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white shadow-lg'>
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </div>
        )}
      </div>
    </button>
  )
}
