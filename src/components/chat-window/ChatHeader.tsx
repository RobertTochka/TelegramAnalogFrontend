'use client'

import { ArrowLeft, MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'

import { formatLastSeen } from '@/utils/format-last-seen'
import { getInitials } from '@/utils/functions'

import { ChatParticipant, EnumUserStatus } from '@/types'

interface ChatHeaderProps {
  typingUsers: Set<string>
  participant: ChatParticipant
  onBack: () => void
}

export const ChatHeader = ({
  typingUsers,
  participant,
  onBack
}: ChatHeaderProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const formatOnline = (lastSeen: string) => {
    if (participant.status === EnumUserStatus.ONLINE) return 'online'
    return formatLastSeen(lastSeen)
  }

  return (
    <div className='border-b border-white/5 bg-slate-900/50 px-4 py-2 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          {isMobile && (
            <Button
              variant='ghost'
              size='icon'
              className='mr-1 text-gray-400 hover:bg-slate-800 hover:text-white'
              onClick={onBack}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
          )}

          {/* Аватар */}
          <div className='relative shrink-0'>
            <Avatar className='h-10 w-10 ring-2 ring-white/10'>
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className='bg-linear-to-r from-purple-600 to-blue-600 text-sm text-white'>
                {getInitials(participant.firstName)}
              </AvatarFallback>
            </Avatar>

            {/* Индикатор онлайн */}
            {participant.status === EnumUserStatus.ONLINE && (
              <span className='absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-slate-900' />
            )}
          </div>

          {/* Информация о пользователе */}
          <div className='min-w-0 flex-1'>
            <h3 className='truncate font-medium text-white'>
              {participant.firstName}
            </h3>
            <div className='flex items-center gap-1 text-xs'>
              {typingUsers.size > 0 ? (
                <div className='flex items-center gap-1 text-purple-400'>
                  <span className='animate-pulse'>Печатает</span>
                  <span className='flex gap-0.5'>
                    <span className='animate-bounce'>.</span>
                    <span className='animate-bounce delay-100'>.</span>
                    <span className='animate-bounce delay-200'>.</span>
                  </span>
                </div>
              ) : (
                <span
                  className={
                    participant.status === EnumUserStatus.ONLINE
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }
                >
                  {formatOnline(participant.lastSeen)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Правая часть с действиями */}
        <div className='flex items-center gap-1'>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-gray-400 hover:bg-slate-800 hover:text-white'
                  >
                    <MoreVertical className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='border-white/5 bg-slate-800 text-white'
              >
                <p>Ещё</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent
              align='end'
              className='w-48 border-white/5 bg-slate-900 text-white'
            >
              <DropdownMenuItem className='cursor-pointer hover:bg-slate-800'>
                Информация о чате
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer hover:bg-slate-800'>
                Поиск в чате
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer hover:bg-slate-800'>
                Очистить историю
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
