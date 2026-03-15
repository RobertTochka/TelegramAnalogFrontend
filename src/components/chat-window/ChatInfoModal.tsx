'use client'

import {
  Crown,
  Hash,
  LinkIcon,
  LogOut,
  Settings,
  UserPlus,
  Users,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  useAddParticipants,
  useCreateInviteLink,
  useGetChats,
  useLeaveChat,
  useRemoveParticipants,
  useUpdateChat
} from '@/api/hooks/chat'
import { useAddAdmin } from '@/api/hooks/chat/use-add-admin'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '../ui'

import { AddParticipantsModal } from './AddParticipantsModal'
import { LeaveChatConfirmModal } from './LeaveChatConfirmModal'
import { ParticipantInfo } from './ParticipantInfo'
import {
  Chat,
  EnumChatType,
  EnumParticipantRole,
  EnumUserStatus,
  Profile
} from '@/types'
import { useChatSocket } from '@/web-socket/hooks/use-chat-socket'

interface ChatInfoModalProps {
  chat: Chat
  currentUser: Profile
  onBack: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeaveChat?: () => void
  onMakePrivate?: () => void
  onAddAdmin?: (participantId: string) => void
  onRemoveParticipant?: (participantId: string) => void
}

export const ChatInfoModal = ({
  chat,
  currentUser,
  onBack,
  open,
  onOpenChange,
  onLeaveChat,
  onMakePrivate,
  onAddAdmin,
  onRemoveParticipant
}: ChatInfoModalProps) => {
  const [copied, setCopied] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false)
  const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false)

  const { updateChat } = useUpdateChat(chat.id)
  const { inviteLink, isLoadingCreate } = useCreateInviteLink(chat.id)
  const { leaveChat, isLoadingLeave } = useLeaveChat()
  const { addAdmin, isLoadingAddAdmin } = useAddAdmin(chat.id)

  const { addParticipants } = useAddParticipants(chat.id)
  const { removeParticipants } = useRemoveParticipants(chat.id)

  useEffect(() => {
    setIsPrivate(chat.isPrivate)
  }, [chat])

  const isDirect = chat.type === EnumChatType.DIRECT
  const isGroup = chat.type === EnumChatType.GROUP
  const isChannel = chat.type === EnumChatType.CHANNEL

  const currentParticipant = chat.participants?.find(
    p => p.id === currentUser.id
  )
  const isAdmin =
    currentParticipant?.role === EnumParticipantRole.ADMIN ||
    currentParticipant?.role === EnumParticipantRole.OWNER
  const isOwner = currentParticipant?.role === EnumParticipantRole.OWNER

  const onlineCount =
    chat.participants?.filter(p => p.status === EnumUserStatus.ONLINE).length ||
    0

  const sortedParticipants = chat.participants?.sort((a, b) => {
    const roleOrder = {
      [EnumParticipantRole.OWNER]: 0,
      [EnumParticipantRole.ADMIN]: 1,
      [EnumParticipantRole.MEMBER]: 2
    }

    return roleOrder[a.role] - roleOrder[b.role]
  })

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const handleUpdateChat = () => {
    updateChat({ isPrivate: !isPrivate })
    setIsPrivate(!isPrivate)
  }

  const handleAddParticipants = (selectedUserIds: string[]) => {
    addParticipants(selectedUserIds)
  }

  const handleLeaveChat = () => {
    if (isLoadingLeave) return

    onBack()
    setIsLeaveConfirmOpen(false)
    onOpenChange(false)
    leaveChat(chat.id)
  }

  const handleRemoveParticipant = (participantId: string) => {
    removeParticipants([participantId])
  }

  const handleAddAdmin = (participantId: string) => {
    if (isLoadingAddAdmin) return

    addAdmin(participantId)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          showCloseButton={false}
          className='max-w-2xl border-white/5 bg-slate-900 p-0 text-white'
        >
          <DialogHeader className='border-b border-white/5 p-6'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-xl font-semibold'>
                Информация о {isDirect ? 'чате' : isGroup ? 'группе' : 'канале'}
              </DialogTitle>
              <Button
                variant='ghost'
                size='icon'
                className='text-gray-400 hover:bg-slate-800 hover:text-white'
                onClick={() => onOpenChange(false)}
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className='max-h-[calc(90vh-8rem)]'>
            <div className='space-y-6 p-6'>
              {/* Основная информация */}
              <div className='flex flex-col items-center space-y-4'>
                <div className='relative'>
                  <Avatar className='h-24 w-24 border-4 border-slate-800'>
                    <AvatarImage
                      src={
                        isDirect
                          ? chat.participants?.find(
                              p => p.id !== currentUser.id
                            )?.avatar
                          : chat.avatar
                      }
                    />
                    <AvatarFallback className='bg-linear-to-br from-purple-600 to-blue-600 text-2xl text-white'>
                      {isDirect
                        ? getInitials(
                            chat.participants?.find(
                              p => p.id !== currentUser.id
                            )?.firstName || '',
                            chat.participants?.find(
                              p => p.id !== currentUser.id
                            )?.lastName || ''
                          )
                        : chat.name?.[0]?.toUpperCase() || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  {isOwner && (
                    <div className='absolute -right-1 -bottom-1 rounded-full bg-slate-800 p-1.5'>
                      <Crown className='h-4 w-4 text-yellow-500' />
                    </div>
                  )}
                </div>

                <div className='text-center'>
                  <h2 className='text-2xl font-bold text-white'>
                    {isDirect
                      ? `${chat.participants?.find(p => p.id !== currentUser.id)?.firstName} ${
                          chat.participants?.find(p => p.id !== currentUser.id)
                            ?.lastName
                        }`
                      : chat.name}
                  </h2>
                  {!isDirect && chat.description && (
                    <p className='mt-1 text-sm text-gray-400'>
                      {chat.description}
                    </p>
                  )}
                </div>

                {/* Статистика */}
                {!isDirect && (
                  <div className='flex gap-4 text-sm'>
                    <div className='text-center'>
                      <div className='font-semibold text-white'>
                        {chat.participantCount || chat.participants?.length}
                      </div>
                      <div className='text-gray-400'>участников</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-green-400'>
                        {onlineCount}
                      </div>
                      <div className='text-gray-400'>в сети</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Действия */}
              {!isDirect && (
                <div className='space-y-3'>
                  <Separator className='bg-white/5' />

                  {/* Тип чата */}
                  <div className='flex items-center justify-between rounded-lg bg-slate-800/50 p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='rounded-full bg-slate-700 p-2'>
                        <Hash className='h-4 w-4 text-purple-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-white'>
                          Тип чата
                        </p>
                        <p className='text-xs text-gray-400'>
                          {isPrivate ? 'Приватный' : 'Публичный'}
                        </p>
                      </div>
                    </div>
                    {(isAdmin || isOwner) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-gray-400 hover:bg-slate-700 hover:text-white'
                            onClick={handleUpdateChat}
                          >
                            <Settings className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Изменить тип чата</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Пригласительная ссылка */}
                  <div className='rounded-lg bg-slate-800/50 p-3'>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <LinkIcon className='h-4 w-4 text-purple-400' />
                        <p className='text-sm font-medium text-white'>
                          Пригласительная ссылка
                        </p>
                      </div>
                      {!showLink && (isAdmin || isOwner || !isPrivate) && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-purple-400 hover:bg-slate-700 hover:text-purple-300'
                          onClick={() => setShowLink(true)}
                        >
                          Сгенерировать
                        </Button>
                      )}
                    </div>
                    {(isAdmin || isOwner || !isPrivate) &&
                      !isLoadingCreate &&
                      inviteLink && (
                        <div className='flex gap-2'>
                          <div
                            className='scrollbar-hide max-w-80 flex-1 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-gray-400 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
                            onClick={e => {
                              if (showLink) {
                                const range = document.createRange()
                                range.selectNodeContents(e.currentTarget)
                                const selection = window.getSelection()
                                selection?.removeAllRanges()
                                selection?.addRange(range)
                              }
                            }}
                            title={
                              showLink ? 'Нажмите чтобы выделить ссылку' : ''
                            }
                          >
                            {showLink
                              ? inviteLink
                              : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                          </div>
                          {showLink && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='border-white/5 bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                              onClick={handleCopyLink}
                            >
                              {copied ? 'Скопировано' : 'Копировать'}
                            </Button>
                          )}
                        </div>
                      )}
                  </div>

                  <Separator className='bg-white/5' />
                </div>
              )}

              {/* Участники */}
              <div>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-gray-400' />
                    <h3 className='font-semibold text-white'>
                      Участники — {chat.participants?.length}
                    </h3>
                  </div>
                  {(isAdmin || isOwner) && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-purple-400 hover:bg-slate-800 hover:text-purple-300'
                      onClick={() => setIsAddParticipantsOpen(true)}
                    >
                      <UserPlus className='mr-2 h-4 w-4' />
                      Добавить
                    </Button>
                  )}
                </div>

                <div className='space-y-2'>
                  {sortedParticipants.map(participant => (
                    <ParticipantInfo
                      key={participant.id}
                      currentUser={currentUser}
                      isAdmin={isAdmin}
                      isOwner={isOwner}
                      participant={participant}
                      onRemoveParticipant={handleRemoveParticipant}
                      onAddAdmin={handleAddAdmin}
                    />
                  ))}
                </div>
              </div>

              {/* Кнопка выхода */}
              {!isDirect && (
                <div className='pt-4'>
                  <Button
                    variant='destructive'
                    className='w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
                    onClick={() => setIsLeaveConfirmOpen(true)}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Покинуть {isGroup ? 'чат' : 'канал'}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <LeaveChatConfirmModal
        chatName={chat.name || ''}
        chatType={chat.type}
        onConfirm={handleLeaveChat}
        onOpenChange={setIsLeaveConfirmOpen}
        open={isLeaveConfirmOpen}
      />

      <AddParticipantsModal
        existingParticipantIds={chat.participants.map(p => p.id)}
        onAdd={handleAddParticipants}
        onOpenChange={setIsAddParticipantsOpen}
        open={isAddParticipantsOpen}
      />
    </>
  )
}
