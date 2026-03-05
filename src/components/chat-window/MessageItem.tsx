import { Check, CheckCheck } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'

import { EnumMessageStatus, Message } from '@/types'

interface MessageItem {
  message: Message
  currentUserId: string
  showAvatar: boolean
}

export const MessageItem = ({
  message,
  currentUserId,
  showAvatar
}: MessageItem) => {
  const isOwn = message.sender!.id === currentUserId

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender?.id !== currentUserId) return null

    const status = message.statuses?.[currentUserId]
    if (status === EnumMessageStatus.READ) {
      return <CheckCheck className='h-3 w-3 text-blue-400' />
    }
    if (status === EnumMessageStatus.DELIVERED) {
      return <CheckCheck className='h-3 w-3 text-gray-500' />
    }
    return <Check className='h-3 w-3 text-gray-500' />
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLongWords = (text: string, maxLength: number = 30): string => {
    if (!text) return text

    const words = text.split(' ')
    const result: string[] = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      if (word.length > maxLength && i > 0) {
        result.push('\n' + word)
      } else {
        result.push(word)
      }
    }

    return result.join(' ')
  }

  return (
    <div
      key={message.id}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-130 items-end gap-2 ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {!isOwn && showAvatar && (
          <Avatar className='h-8 w-8 shrink-0 ring-2 ring-white/10'>
            <AvatarImage src={message.sender?.avatar} />
            <AvatarFallback className='bg-linear-to-r from-purple-600 to-blue-600 text-xs text-white'>
              {message.sender?.firstName?.[0]}
              {message.sender?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
        {!isOwn && !showAvatar && <div className='w-8 shrink-0' />}

        <div
          className={`group relative rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {!isOwn && showAvatar && (
            <p className='mb-1 text-xs font-semibold text-purple-400'>
              {message.sender?.firstName} {message.sender?.lastName}
            </p>
          )}
          <p className='max-w-full px-0 text-sm break-all whitespace-pre-wrap'>
            {formatLongWords(message.content)}
          </p>

          <div
            className={`mt-1 flex items-center justify-end gap-1 text-xs ${
              isOwn ? 'text-white/70' : 'text-gray-400'
            }`}
          >
            <span>{formatMessageTime(message.createdAt)}</span>
            {getMessageStatusIcon(message)}
          </div>
        </div>
      </div>
    </div>
  )
}
