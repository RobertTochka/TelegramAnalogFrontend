import Link from 'next/link'

import { cn } from '@/utils/clsx'
import { getInitials } from '@/utils/functions'

import { Avatar, AvatarFallback, AvatarImage } from '../ui'

import { EnumUserStatus } from '@/types'

interface UserAvatarProps {
  avatar: string | undefined
  firstName: string
  status?: EnumUserStatus
  className?: string
  textSize?: string
}

export const UserAvatar = ({
  avatar,
  firstName,
  status,
  className,
  textSize
}: UserAvatarProps) => {
  return (
    <div className='relative'>
      <Avatar className={cn('h-10 w-10 ring-2 ring-white/10', className)}>
        <AvatarImage src={avatar} />
        <AvatarFallback
          className={cn(
            'bg-linear-to-r from-purple-600 to-blue-600 text-sm text-white',
            textSize
          )}
        >
          {firstName && getInitials(firstName)}
        </AvatarFallback>
      </Avatar>

      {/* Индикатор онлайн */}
      {status && status === EnumUserStatus.ONLINE && (
        <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-slate-900' />
      )}
    </div>
  )
}
