import { UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent
} from '@/components/ui'

import { EnumUserStatus, User } from '@/types'

interface FriendRequestCardProps {
  user: User
  type: 'incoming' | 'outgoing'
  onPatch?: (friendId: string, accept: boolean) => void
  isLoading?: boolean
}

export const FriendRequestCard = ({
  user,
  type,
  onPatch,
  isLoading
}: FriendRequestCardProps) => {
  return (
    <Card className='border-white/5 bg-slate-800/50'>
      <CardContent className='flex items-center gap-3 p-3'>
        <div className='relative'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={user.avatar} />
            <AvatarFallback className='bg-linear-to-br from-purple-600 to-blue-600 text-white'>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${
              user.status === EnumUserStatus.ONLINE
                ? 'bg-green-500'
                : 'bg-gray-500'
            }`}
          />
        </div>

        <div className='min-w-0 flex-1'>
          <Link
            href={`/profile/${user.id}`}
            className='hover:underline'
          >
            <p className='truncate font-medium text-white'>
              {user.firstName} {user.lastName}
            </p>
          </Link>
          {user.username && (
            <p className='truncate text-xs text-gray-400'>@{user.username}</p>
          )}
        </div>

        {type === 'incoming' && onPatch && (
          <div className='flex gap-2'>
            <Button
              size='sm'
              onClick={() => onPatch(user.id, true)}
              disabled={isLoading}
              className='bg-green-500/90 text-white hover:bg-green-600'
            >
              <UserCheck className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              onClick={() => onPatch(user.id, false)}
              variant='ghost'
              className='text-red-400 hover:bg-red-500/10 hover:text-red-500'
            >
              <UserX className='h-4 w-4' />
            </Button>
          </div>
        )}

        {type === 'outgoing' && (
          <Badge
            variant='outline'
            className='border-yellow-500/30 text-yellow-500'
          >
            Ожидает
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
