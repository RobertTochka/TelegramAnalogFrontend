'use client'

import { ChevronDown, Loader2, MessageCircle } from 'lucide-react'
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import toast from 'react-hot-toast'

import { useGetChats } from '@/api/hooks/chat'

import { Button, ScrollArea } from '@/components/ui'

import { ChatListItem } from './ChatListItem'
import { ChatListLoading } from './ChatListLoading'
import { ChatListSearch } from './ChatListSearch'
import { Chat, ChatFilter, EnumChatType } from '@/types'
import { useChatSocket } from '@/web-socket/hooks/use-chat-socket'

interface ChatListProps {
  currentUserId: string
  selectedChatId: string
  setSelectedChatId: Dispatch<SetStateAction<string>>
  searchQuery: string
  chatsQuery: ChatFilter
  setChatsQuery: Dispatch<SetStateAction<ChatFilter>>
  setSearchQuery: Dispatch<SetStateAction<string>>
}

export const ChatList: FC<ChatListProps> = ({
  currentUserId,
  selectedChatId,
  setSelectedChatId,
  searchQuery,
  setSearchQuery,
  chatsQuery,
  setChatsQuery
}) => {
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const {
    chats,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isEmpty
  } = useGetChats(chatsQuery)

  useChatSocket({
    chatsQuery,
    onNewChat: data => {
      toast.success(`Новый чат: ${data.chat.name || 'Без названия'}`)
    },
    onChatDeleted: data => {
      if (selectedChatId === data.chatId) {
        setSelectedChatId('')
      }
      toast.error('Чат был удален')
    },
    onChatAdded: data => {
      toast.success('Вас добавили в чат')
    },
    onChatRemoved: data => {
      if (selectedChatId === data.chatId) {
        setSelectedChatId('')
      }
      toast.error('Вас удалили из чата')
    },
    onParticipantJoined: data => {
      toast(`${data.message}`, { icon: '👋' })
    },
    onParticipantLeft: data => {
      toast(`${data.message}`, { icon: '👋' })
    }
  })

  // Фильтрация чатов при изменении поиска
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

  if (isLoading) {
    return <ChatListLoading />
  }

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <ChatListSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Список чатов */}
      <ScrollArea
        className='flex-1'
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {isEmpty ? (
          <div className='flex h-64 flex-col items-center justify-center text-gray-400'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl' />
              <MessageCircle className='relative h-12 w-12 text-purple-500/50' />
            </div>
            <p className='text-sm'>Нет чатов</p>
            <p className='mt-2 text-xs text-gray-500'>
              Начните общение, создав новый чат
            </p>
          </div>
        ) : (
          <div className='divide-y divide-white/5'>
            {filteredChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                selectedChatId={selectedChatId}
                setSelectedChatId={setSelectedChatId}
                currentUserId={currentUserId}
              />
            ))}

            {/* Индикатор загрузки */}
            {isFetchingNextPage && (
              <div className='flex justify-center py-4'>
                <Loader2 className='h-5 w-5 animate-spin text-purple-500' />
              </div>
            )}

            {/* Кнопка загрузки еще */}
            {hasNextPage && !isFetchingNextPage && (
              <Button
                variant='ghost'
                className='w-full py-4 text-gray-400 transition-colors hover:bg-slate-800 hover:text-white'
                onClick={() => fetchNextPage()}
              >
                <ChevronDown className='mr-2 h-4 w-4' />
                Загрузить еще
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
