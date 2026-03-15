import {
  Check,
  CheckCheck,
  CircleAlert,
  CornerUpRight,
  FileWarning,
  FileWarningIcon,
  Forward,
  LucideMessageCircleWarning,
  MailWarning,
  MessageCircleWarning
} from 'lucide-react'

import { formatLongWords, formatMessageTime } from '@/utils/functions'

import { EnumMessageStatus, Message } from '@/types'

interface MessageBubbleProps {
  isOwn: boolean
  currentUserId: string
  message: Message
  showAvatar: boolean
}

export const MessageBubble = ({
  isOwn,
  currentUserId,
  message,
  showAvatar
}: MessageBubbleProps) => {
  const getMessageStatusIcon = () => {
    if (!isOwn) return null

    const status = message.statuses?.[currentUserId]

    if (status === EnumMessageStatus.READ) {
      return <CheckCheck className='h-3 w-3 text-blue-400' />
    }
    if (status === EnumMessageStatus.DELIVERED) {
      return <CheckCheck className='h-3 w-3 text-gray-300' />
    }
    if (status === EnumMessageStatus.SENT) {
      return <Check className='h-3 w-3 text-gray-300' />
    }
    if (status === EnumMessageStatus.FAILED)
      return <CircleAlert className='h-3 w-3 text-red-500' />
  }

  const getMargin = () => {
    if (isOwn) return 'items-end mr-10'
    if (!isOwn && showAvatar) return 'items-start'
    if (!isOwn && !showAvatar) return 'items-start ml-10'
  }

  return (
    <div className={`group relative max-w-full ${getMargin()}`}>
      {/* Блок сообщения */}
      <div
        className={`relative rounded-2xl px-4 py-2 wrap-break-word ${
          isOwn
            ? 'rounded-br-none bg-purple-600 text-white'
            : 'rounded-bl-none bg-slate-700 text-white'
        } ${message.replyTo ? 'pt-3' : ''} ${message.forwardedFrom ? 'pt-3' : ''} `}
      >
        {message.forwardedFrom && (
          <div className='mb-1 flex items-center gap-1 text-xs opacity-75'>
            <Forward className='h-3 w-3' />
            <span className='font-medium'>
              Переслано от {message.forwardedFrom.sender?.firstName}
            </span>
          </div>
        )}

        {message.replyTo && (
          <div
            className={`mb-2 rounded-lg border-l-4 py-1.5 pr-4 pl-3 text-sm ${
              isOwn
                ? 'border-purple-300 bg-purple-500/50'
                : 'border-slate-500 bg-slate-600/50'
            } `}
          >
            <div className='mb-0.5 flex items-center gap-1 text-xs opacity-90'>
              <CornerUpRight className='h-3 w-3' />
              <span className='font-medium'>
                {message.replyTo.sender?.id === currentUserId
                  ? 'Вы'
                  : message.replyTo.sender?.firstName}
              </span>
            </div>
            <div className='line-clamp-2 text-xs opacity-90'>
              {message.replyTo.content || '📎 Медиафайл'}
            </div>
          </div>
        )}

        {/* Текст сообщения */}
        {message.forwardedFrom?.content && (
          <div className='mb-3 text-xs wrap-break-word whitespace-pre-wrap'>
            {formatLongWords(message.forwardedFrom.content)}
          </div>
        )}
        {message.content && (
          <div className='wrap-break-word whitespace-pre-wrap'>
            {formatLongWords(message.content)}
          </div>
        )}

        {/* Время и статус */}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-xs ${
            isOwn ? 'text-purple-200' : 'text-gray-300'
          }`}
        >
          {message.isEdited && <span>ред.</span>}
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && getMessageStatusIcon()}
        </div>
      </div>
    </div>
  )
}
