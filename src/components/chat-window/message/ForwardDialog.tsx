// components/chat/ForwardDialog.tsx
import { Search, Send, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'

import { ChatListLoading } from '@/components/chat-list'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea
} from '@/components/ui'

import { Chat, EnumChatType, Message } from '@/types'

interface ForwardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: Message | null
  currentUserId: string
  onForward: (forwardedFrom?: Message, forwardContent?: string) => void
}

export const ForwardDialog = ({
  open,
  onOpenChange,
  message,
  currentUserId,
  onForward
}: ForwardDialogProps) => {
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!message) return null

  const {
    chats,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isEmpty
  } = useGetChats({
    limit: 20,
    search: searchQuery || undefined
  })

  useEffect(() => {
    if (searchQuery) {
      const filtered = chats.filter(chat => {
        if (chat.type === EnumChatType.DIRECT) {
          const otherParticipant = chat.participants?.find(
            p => p.id !== currentUserId
          )
          const name =
            otherParticipant?.firstName ||
            otherParticipant?.username ||
            'Пользователь'
          return name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
      })
      setFilteredChats(filtered)
    } else {
      setFilteredChats(chats)
    }
  }, [chats, searchQuery, currentUserId])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  const handleForward = () => {
    if (!selectedChatId) {
      toast.error('Выберите чат для пересылки')
      return
    }

    onForward(message, customMessage)
    onOpenChange(false)
    setSelectedChatId('')
    setCustomMessage('')
    setSearchQuery('')
    toast.success('Сообщение отправлено')
  }

  const getChatName = (chat: Chat) => {
    const participant = chat.participants.find(p => p.id !== currentUserId)
    if (!participant) return 'Чат'
    return (
      `${participant.firstName || ''} ${participant.lastName || ''}`.trim() ||
      'Пользователь'
    )
  }

  const getChatAvatar = (chat: Chat) => {
    const participant = chat.participants.find(p => p.id !== currentUserId)
    return participant?.avatar
  }

  if (isLoading) return <ChatListLoading />

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='border border-white/10 bg-slate-900 text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Переслать сообщение
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Предпросмотр сообщения */}
          <div className='rounded-lg border border-white/5 bg-slate-800/50 p-3'>
            <div className='mb-1 text-xs text-gray-400'>
              {message.sender?.firstName} {message.sender?.lastName}:
            </div>
            <div className='text-sm text-gray-300'>
              {message.content || 'Медиафайл'}
            </div>
          </div>

          {/* Дополнительное сообщение */}
          <div>
            <label className='mb-1 block text-sm text-gray-400'>
              Сообщение
            </label>
            <Input
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder='Напишите что-нибудь...'
              className='w-full border-white/5 bg-slate-800 text-white placeholder:text-gray-500 focus:border-purple-500'
            />
          </div>

          {/* Поиск чатов */}
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Поиск чатов...'
              className='w-full border-white/5 bg-slate-800 pl-9 text-white placeholder:text-gray-500 focus:border-purple-500'
            />
          </div>

          <ScrollArea
            className='flex-1'
            onScroll={handleScroll}
            ref={scrollRef}
          >
            {/* Список чатов */}
            <div className='custom-scrollbar max-h-64 space-y-1 overflow-y-auto'>
              {filteredChats.length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  Чаты не найдены
                </div>
              ) : (
                filteredChats.map(chat => {
                  const isSelected = selectedChatId === chat.id
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-2 transition-colors ${
                        isSelected
                          ? 'border border-purple-500/30 bg-purple-500/20'
                          : 'hover:bg-slate-800'
                      }`}
                    >
                      <Avatar className='h-10 w-10 shrink-0'>
                        <AvatarImage src={getChatAvatar(chat)} />
                        <AvatarFallback className='bg-slate-700'>
                          {getChatName(chat)[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 text-left'>
                        <div className='font-medium text-white'>
                          {getChatName(chat)}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {chat.lastMessage?.content || 'Нет сообщений'}
                        </div>
                      </div>
                      {isSelected && (
                        <div className='h-2 w-2 rounded-full bg-purple-500' />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <div className='mt-4 flex gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='flex-1 border-white/10 bg-slate-800 text-white hover:bg-slate-700'
          >
            Отмена
          </Button>
          <Button
            onClick={handleForward}
            disabled={!selectedChatId}
            className='flex-1 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
          >
            <Send className='mr-2 h-4 w-4' />
            Переслать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
