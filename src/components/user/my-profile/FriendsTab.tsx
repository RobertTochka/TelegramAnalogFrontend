'use client'

import { Clock, Search, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { useGetFriends, usePatchFriend } from '@/api/hooks/users'

import {
  Badge,
  Button,
  Input,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'

import { FriendCard } from './FriendCard'
import { FriendRequestCard } from './FriendRequestCard'
import { EnumFriendshipStatus } from '@/types'

interface FriendsTabProps {
  currentUserId?: string
}

export const FriendsTab = ({ currentUserId }: FriendsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { friendResponse, isLoadingFriendResponse } = useGetFriends()
  const { patchFriend, isLoadingPatchFriend } = usePatchFriend()

  const handlePatchRequest = (friendId: string, accept: boolean) => {
    patchFriend({
      friendId,
      status: accept
        ? EnumFriendshipStatus.ACCEPTED
        : EnumFriendshipStatus.DECLINED
    })
  }

  const filterUsers = (users: any[]) => {
    if (!searchQuery) return users
    return users.filter(
      user =>
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (isLoadingFriendResponse) {
    return (
      <div className='flex justify-center py-8'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-purple-500' />
      </div>
    )
  }

  const incomingRequests =
    friendResponse?.friendRequests?.incomingRequests || []
  const outgoingRequests =
    friendResponse?.friendRequests?.outgoingRequests || []
  const friends = friendResponse?.friends || []

  const filteredIncoming = filterUsers(incomingRequests)
  const filteredOutgoing = filterUsers(outgoingRequests)
  const filteredFriends = filterUsers(friends)

  return (
    <div className='space-y-4'>
      {/* Поиск */}
      <div className='relative'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Поиск друзей...'
          className='border-white/5 bg-slate-800/50 pl-9 text-white placeholder:text-gray-500'
        />
      </div>

      <Tabs
        defaultValue='all'
        className='w-full'
      >
        <TabsList className='w-full bg-slate-800/50 p-1'>
          <TabsTrigger
            value='all'
            className='flex-1 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600'
          >
            Все друзья
            <span className='ml-2 text-xs text-gray-400'>{friends.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value='requests'
            className='flex-1 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600'
          >
            Заявки
            {incomingRequests.length > 0 && (
              <Badge className='ml-2 border-0 bg-red-500/90 text-white'>
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Вкладка с заявками */}
        <TabsContent
          value='requests'
          className='mt-4'
        >
          <ScrollArea className='h-100 pr-4'>
            <div className='space-y-4'>
              {/* Входящие заявки */}
              {filteredIncoming.length > 0 && (
                <div>
                  <h4 className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-400'>
                    <UserPlus className='h-4 w-4' />
                    Входящие заявки
                  </h4>
                  <div className='space-y-2'>
                    {filteredIncoming.map(user => (
                      <FriendRequestCard
                        key={user.id}
                        user={user}
                        type='incoming'
                        onPatch={handlePatchRequest}
                        isLoading={isLoadingPatchFriend}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Исходящие заявки */}
              {filteredOutgoing.length > 0 && (
                <div>
                  <h4 className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-400'>
                    <Clock className='h-4 w-4' />
                    Ожидают ответа
                  </h4>
                  <div className='space-y-2'>
                    {filteredOutgoing.map(user => (
                      <FriendRequestCard
                        key={user.id}
                        user={user}
                        type='outgoing'
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredIncoming.length === 0 &&
                filteredOutgoing.length === 0 && (
                  <div className='py-12 text-center'>
                    <UserPlus className='mx-auto mb-3 h-12 w-12 text-gray-600' />
                    <p className='text-gray-400'>Нет активных заявок</p>
                  </div>
                )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Вкладка со всеми друзьями */}
        <TabsContent
          value='all'
          className='mt-4'
        >
          <ScrollArea className='h-100 pr-4'>
            {filteredFriends.length > 0 ? (
              <div className='space-y-2'>
                {filteredFriends.map(friend => (
                  <FriendCard
                    key={friend.id}
                    user={friend}
                  />
                ))}
              </div>
            ) : (
              <div className='py-12 text-center'>
                <Users className='mx-auto mb-3 h-12 w-12 text-gray-600' />
                <p className='text-gray-400'>У вас пока нет друзей</p>
                <Button className='mt-4 bg-linear-to-r from-purple-600 to-blue-600 text-white'>
                  Найти друзей
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
