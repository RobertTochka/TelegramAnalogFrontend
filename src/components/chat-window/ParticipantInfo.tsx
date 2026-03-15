import { Crown, Settings, Shield, UserMinus } from 'lucide-react'
import Link from 'next/link'

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui'
import { UserAvatar } from '../user/UserAvatar'

import {
  ChatParticipant,
  EnumParticipantRole,
  EnumUserStatus,
  User
} from '@/types'

interface ParticipantInfoProps {
  participant: ChatParticipant
  currentUser: User
  isOwner: boolean
  isAdmin: boolean
  onAddAdmin?: (participantId: string) => void
  onRemoveParticipant?: (participantId: string) => void
}

export const ParticipantInfo = ({
  participant,
  currentUser,
  isOwner,
  isAdmin,
  onAddAdmin,
  onRemoveParticipant
}: ParticipantInfoProps) => {
  const isCurrentUser = participant.id === currentUser.id
  const canManage =
    (isOwner || (isAdmin && participant.role !== EnumParticipantRole.OWNER)) &&
    !isCurrentUser

  const getRoleIcon = (role: EnumParticipantRole) => {
    switch (role) {
      case EnumParticipantRole.OWNER:
        return <Crown className='h-4 w-4 text-yellow-500' />
      case EnumParticipantRole.ADMIN:
        return <Shield className='h-4 w-4 text-blue-400' />
      default:
        return null
    }
  }

  const getRoleBadge = (role: EnumParticipantRole) => {
    switch (role) {
      case EnumParticipantRole.OWNER:
        return (
          <Badge className='bg-yellow-500/10 text-yellow-500'>Владелец</Badge>
        )
      case EnumParticipantRole.ADMIN:
        return <Badge className='bg-blue-500/10 text-blue-400'>Админ</Badge>
      default:
        return null
    }
  }

  return (
    <div className='flex items-center justify-between rounded-lg p-2 hover:bg-slate-800/50'>
      <Link
        href={`/profile/${participant.id}`}
        className='flex min-w-0 items-center gap-3'
      >
        <div className='relative'>
          <UserAvatar
            avatar={participant.avatar}
            firstName={participant.firstName}
            status={participant.status}
            className='h-10 w-10'
          />
          {getRoleIcon(participant.role)}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <p className='truncate font-medium text-white'>
              {participant.firstName} {participant.lastName}
              {isCurrentUser && (
                <span className='ml-2 text-xs text-gray-400'>(Вы)</span>
              )}
            </p>
            {participant.role !== EnumParticipantRole.MEMBER &&
              getRoleBadge(participant.role)}
          </div>
          <p className='text-xs text-gray-400'>
            {participant.status === EnumUserStatus.ONLINE ? (
              <span className='text-green-400'>online</span>
            ) : (
              `был(а) ${new Date(participant.lastSeen).toLocaleDateString()}`
            )}
          </p>
        </div>
      </Link>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:bg-slate-700 hover:text-white'
            >
              <Settings className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='border-white/5 bg-slate-800 text-white'
          >
            {participant.role !== EnumParticipantRole.ADMIN && (
              <DropdownMenuItem
                className='cursor-pointer hover:bg-slate-700'
                onClick={() => onAddAdmin?.(participant.id)}
              >
                <Shield className='mr-2 h-4 w-4' />
                Сделать админом
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className='cursor-pointer text-red-400 hover:bg-slate-700 hover:text-red-300'
              onClick={() => onRemoveParticipant?.(participant.id)}
            >
              <UserMinus className='mr-2 h-4 w-4' />
              Исключить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
