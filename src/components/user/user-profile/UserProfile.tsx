'use client'

import {
  ChevronRight,
  Clock,
  Mail,
  MessageCircle,
  MoreVertical,
  UserCheck,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useAddFriend,
  useGetFriends,
  useGetUser,
  usePatchFriend
} from '@/api/hooks/users'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator
} from '@/components/ui'

import { formatLastSeen } from '@/utils/format-last-seen'

import { UserAvatar } from '../UserAvatar'

import { EnumFriendshipStatus, EnumUserStatus } from '@/types'

export default function UserProfile() {
  const router = useRouter()
  const { user, isLoadingUser } = useGetUser()
  const { friendResponse } = useGetFriends()
  const { addFriend, isLoadingAddFriend } = useAddFriend()
  const { patchFriend, isLoadingPatchFriend } = usePatchFriend()

  // TODO:
  // useEffect(() => {
  //   const currentUserId = getMe()
  //   if (currentUserId === user?.id) router.push('/profile')
  // }, [user])

  // Определяем статус дружбы
  const friendshipStatus = (() => {
    if (!friendResponse || !user) return null

    const isFriend = friendResponse.friends?.some(f => f.id === user.id)
    if (isFriend) return 'friend'

    const incomingRequest =
      friendResponse.friendRequests?.incomingRequests?.some(
        f => f.id === user.id
      )
    if (incomingRequest) return 'incoming'

    const outgoingRequest =
      friendResponse.friendRequests?.outgoingRequests?.some(
        f => f.id === user.id
      )
    if (outgoingRequest) return 'outgoing'

    return null
  })()

  const handleAddFriend = () => {
    if (!user) return
    addFriend({ friendId: user.id })
  }

  const handlePatchFriend = (status: EnumFriendshipStatus) => {
    if (!user) return
    patchFriend({ friendId: user.id, status })
  }

  const handleStartChat = () => {
    // Перенаправление в чат с пользователем
    router.push(`/chats/${user?.id}`)
  }

  if (isLoadingUser) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
        <div className='relative'>
          <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
          <div className='relative h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-purple-500' />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
        <Card className='border-white/5 bg-slate-800/50 p-8 text-center'>
          <p className='text-gray-400'>Пользователь не найден</p>
          <Button
            onClick={() => router.back()}
            className='mt-4 bg-linear-to-r from-purple-600 to-blue-600 text-white'
          >
            Вернуться назад
          </Button>
        </Card>
      </div>
    )
  }

  const isOnline = user.status === EnumUserStatus.ONLINE

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
      {/* Шапка профиля */}
      <div className='relative h-48 bg-linear-to-r from-purple-600/20 to-blue-600/20'>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />

        {/* Кнопка назад */}
        <Link
          href='/'
          className='absolute top-4 left-4 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30'
        >
          <ChevronRight className='h-5 w-5 rotate-180 text-white' />
        </Link>

        {/* Меню с действиями */}
        <div className='absolute top-4 right-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30'>
                <MoreVertical className='h-5 w-5 text-white' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-48'
            >
              <DropdownMenuItem>Пожаловаться</DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-500'
                onClick={() => handlePatchFriend(EnumFriendshipStatus.BLOCKED)}
              >
                Заблокировать
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Основной контент с шириной 640px */}
      <div className='mx-auto max-w-160 px-4'>
        {/* Аватар */}
        <div className='relative'>
          <div className='absolute -top-16 left-1/2 -translate-x-1/2'>
            <div className='group relative'>
              <UserAvatar
                avatar={user.avatar}
                firstName={user.firstName}
                status={user.status}
                className='absolute -top-18 left-1/2 h-32 w-32 -translate-x-1/2 border-4 border-slate-800'
                textSize='text-4xl'
              />
            </div>
          </div>
        </div>

        {/* Имя пользователя и статус */}
        <div className='mt-20 text-center'>
          <h1 className='text-2xl font-bold text-white'>
            {user.firstName} {user.lastName}
          </h1>
          {user.username && (
            <p className='mt-1 text-sm text-gray-400'>@{user.username}</p>
          )}

          {/* Статус */}
          <div className='mt-2 flex items-center justify-center gap-2'>
            <div
              className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
            />
            <span className='text-sm text-gray-400'>
              {isOnline ? 'В сети' : formatLastSeen(user.lastSeen)}
            </span>
          </div>

          {/* Описание */}
          {user.description && (
            <Card className='mt-4 border-white/5 bg-slate-800/50'>
              <CardContent className='p-4'>
                <p className='text-sm whitespace-pre-wrap text-gray-300'>
                  {user.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Кнопки действий */}
        <div className='mt-6 flex gap-3'>
          {friendshipStatus === 'friend' ? (
            <>
              <Button
                onClick={handleStartChat}
                className='flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                Написать
              </Button>
              <Button
                variant='outline'
                className='flex-1 border-white/10 bg-slate-800/50 text-white hover:bg-slate-700'
              >
                <UserCheck className='mr-2 h-4 w-4' />
                Друг
              </Button>
            </>
          ) : friendshipStatus === 'incoming' ? (
            <>
              <Button
                onClick={() => handlePatchFriend(EnumFriendshipStatus.ACCEPTED)}
                disabled={isLoadingPatchFriend}
                className='flex-1 bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
              >
                <UserCheck className='mr-2 h-4 w-4' />
                Принять заявку
              </Button>
              <Button
                variant='outline'
                className='flex-1 border-white/10 bg-slate-800/50 text-white hover:bg-slate-700'
              >
                <Clock className='mr-2 h-4 w-4' />
                Ожидает
              </Button>
            </>
          ) : friendshipStatus === 'outgoing' ? (
            <Button
              disabled
              variant='outline'
              className='flex-1 border-white/10 bg-slate-800/50 text-white'
            >
              <Clock className='mr-2 h-4 w-4' />
              Заявка отправлена
            </Button>
          ) : (
            <Button
              onClick={handleAddFriend}
              disabled={isLoadingAddFriend}
              className='flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            >
              <UserPlus className='mr-2 h-4 w-4' />
              Добавить в друзья
            </Button>
          )}
        </div>

        {/* Дополнительная информация */}
        <Separator className='my-6 bg-white/5' />

        {/* Общие друзья (если есть) */}
        {user.friends && user.friends.length > 0 && (
          <>
            <Separator className='my-6 bg-white/5' />

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  Общие друзья
                </h3>
                <Badge
                  variant='outline'
                  className='border-purple-500/30 text-purple-400'
                >
                  {user.friends.length}
                </Badge>
              </div>

              <div className='space-y-2'>
                {user.friends.slice(0, 3).map(friend => (
                  <Link
                    key={friend.id}
                    href={`/profile/${friend.id}`}
                    className='block'
                  >
                    <Card className='border-white/5 bg-slate-800/50 transition-colors hover:bg-slate-800/70'>
                      <CardContent className='flex items-center gap-3 p-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback className='bg-linear-to-br from-purple-600 to-blue-600 text-white'>
                            {friend.firstName?.[0]}
                            {friend.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium text-white'>
                            {friend.firstName} {friend.lastName}
                          </p>
                          {friend.username && (
                            <p className='text-xs text-gray-400'>
                              @{friend.username}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {user.friends.length > 3 && (
                  <Button
                    variant='link'
                    className='text-purple-400 hover:text-purple-300'
                  >
                    Показать всех ({user.friends.length})
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
