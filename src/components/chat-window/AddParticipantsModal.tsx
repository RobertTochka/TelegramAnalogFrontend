'use client'

import { Search, UserPlus, X } from 'lucide-react'
import { useState } from 'react'

import { useGetFriends } from '@/api/hooks/users'

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea
} from '../ui'
import { UserAvatar } from '../user/UserAvatar'

interface AddParticipantsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (selectedUserIds: string[]) => void
  existingParticipantIds: string[]
}

export const AddParticipantsModal = ({
  open,
  onOpenChange,
  onAdd,
  existingParticipantIds
}: AddParticipantsModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const { friendResponse, isLoadingFriendResponse } = useGetFriends()

  const filteredFriends =
    friendResponse?.friends.filter(friend => {
      const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase()
      const search = searchQuery.toLowerCase()
      return (
        fullName.includes(search) ||
        friend.username?.toLowerCase().includes(search)
      )
    }) || []

  const availableFriends = filteredFriends.filter(
    friend => !existingParticipantIds.includes(friend.id)
  )

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleAdd = () => {
    onAdd(Array.from(selectedUsers))
    setSelectedUsers(new Set())
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className='max-w-md border-white/5 bg-slate-900 p-0 text-white'
      >
        <DialogHeader className='border-b border-white/5 p-4'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-lg font-semibold'>
              Добавить участников
            </DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:bg-slate-800 hover:text-white'
              onClick={() => onOpenChange(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </DialogHeader>

        {/* Поиск */}
        <div className='p-4'>
          <div className='group relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400' />
            <Input
              placeholder='Поиск друзей...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='border-white/5 bg-slate-800/50 pl-9 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            />
          </div>
        </div>

        {/* Количество выбранных и кнопка "Выбрать всех" */}
        {availableFriends.length > 0 && (
          <div className='flex items-center justify-between px-4 py-2 text-sm'>
            <span className='text-gray-400'>
              Выбрано: {selectedUsers.size} из {availableFriends.length}
            </span>
          </div>
        )}

        {/* Список друзей */}
        <ScrollArea className='max-h-100 px-4'>
          {isLoadingFriendResponse ? (
            <div className='flex items-center justify-center py-8'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent' />
            </div>
          ) : availableFriends.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <div className='mb-3 rounded-full bg-slate-800 p-3'>
                <UserPlus className='h-6 w-6 text-gray-400' />
              </div>
              <p className='text-sm text-gray-400'>
                {searchQuery
                  ? 'Ничего не найдено'
                  : 'Нет доступных друзей для добавления'}
              </p>
              {!searchQuery && (
                <p className='mt-1 text-xs text-gray-500'>
                  Все ваши друзья уже в этом чате
                </p>
              )}
            </div>
          ) : (
            <div className='space-y-1 pb-4'>
              {availableFriends.map(friend => (
                <div
                  key={friend.id}
                  className='flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-slate-800/50'
                  onClick={() => handleToggleUser(friend.id)}
                >
                  <div className='flex items-center gap-3'>
                    <UserAvatar
                      avatar={friend.avatar}
                      firstName={friend.firstName}
                      status={friend.status}
                      className='h-10 w-10'
                    />
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
                  </div>
                  <Checkbox
                    checked={selectedUsers.has(friend.id)}
                    onCheckedChange={() => handleToggleUser(friend.id)}
                    onClick={() => handleToggleUser(friend.id)}
                    className='cursor-pointer border-2 border-gray-500 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500'
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Футер с кнопками */}
        <DialogFooter className='border-t border-white/5 p-4'>
          <Button
            variant='outline'
            className='flex-1 border-white/5 bg-slate-800 text-white hover:bg-slate-700'
            onClick={() => {
              setSelectedUsers(new Set())
              setSearchQuery('')
              onOpenChange(false)
            }}
          >
            Отмена
          </Button>
          <Button
            className='flex-1 bg-purple-600 text-white hover:bg-purple-700'
            onClick={handleAdd}
            disabled={selectedUsers.size === 0}
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Добавить ({selectedUsers.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
