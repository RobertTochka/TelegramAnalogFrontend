'use client'

import { ArrowLeft, MoreVertical, Search, X } from 'lucide-react'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'

import { formatLastSeen } from '@/utils/format-last-seen'

import { UserAvatar } from '../user/UserAvatar'

import { ChatParticipant, EnumUserStatus, MessageFilter } from '@/types'

interface ChatHeaderProps {
  typingUsers: Set<string>
  participant: ChatParticipant
  onBack: () => void
  messagesQuery: Omit<MessageFilter, 'page'>
  setMessagesQuery: Dispatch<SetStateAction<Omit<MessageFilter, 'page'>>>
}

export const ChatHeader = ({
  typingUsers,
  participant,
  onBack,
  messagesQuery,
  setMessagesQuery
}: ChatHeaderProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpenSearch, setIsOpenSearch] = useState(false)

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
          <Link
            className='relative shrink-0'
            href={`profile/${participant.id}`}
          >
            <UserAvatar
              avatar={participant.avatar}
              firstName={participant.firstName}
              status={participant.status}
              userId={participant.id}
            />
          </Link>

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
              <DropdownMenuItem
                className='cursor-pointer hover:bg-slate-800'
                onClick={() => setIsOpenSearch(true)}
              >
                Поиск в чате
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer hover:bg-slate-800'
                onClick={() => setIsOpenSearch(true)}
              >
                Очистить историю
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isOpenSearch && (
        <div className='flex gap-4 border-b border-white/5 p-4'>
          <div className='group relative w-full'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400' />
            <Input
              type='text'
              placeholder='Поиск чатов...'
              value={messagesQuery.search}
              onChange={e => setMessagesQuery({ search: e.target.value })}
              className='border-white/5 bg-slate-800/50 pl-9 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            />
          </div>
          <button
            className='text-sm text-white'
            onClick={() => setIsOpenSearch(false)}
          >
            <X />
          </button>
        </div>
      )}
    </div>
  )
}
