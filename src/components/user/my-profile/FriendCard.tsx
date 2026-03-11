import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent
} from '@/components/ui'

import { EnumUserStatus, User } from '@/types'

export const FriendCard = ({ user }: { user: User }) => {
  return (
    <Card className='border-white/5 bg-slate-800/50 transition-colors hover:bg-slate-800/70'>
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
          <p className='text-xs text-gray-400'>
            {user.status === EnumUserStatus.ONLINE
              ? 'В сети'
              : 'Был(а) недавно'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
