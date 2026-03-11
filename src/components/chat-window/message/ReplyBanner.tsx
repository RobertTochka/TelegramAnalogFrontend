import { X } from 'lucide-react'

import { Message } from '@/types'

interface ReplyBannerProps {
  replyTo?: Message
  onCancel: () => void
}

export const ReplyBanner = ({ replyTo, onCancel }: ReplyBannerProps) => {
  if (!replyTo) return null

  return (
    <div className='flex items-center justify-between border-t border-white/5 bg-slate-800/90 px-4 py-2 backdrop-blur-sm'>
      <div className='min-w-0 flex-1'>
        <div className='mb-0.5 text-xs font-medium text-purple-400'>
          Ответ для {replyTo.sender?.firstName}
        </div>
        <div className='truncate text-sm text-gray-300'>{replyTo.content}</div>
      </div>
      <button
        onClick={onCancel}
        className='ml-2 rounded-full p-1 transition-colors hover:bg-slate-700'
      >
        <X className='h-4 w-4 text-gray-400' />
      </button>
    </div>
  )
}
