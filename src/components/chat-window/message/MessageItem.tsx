import { Copy, Forward, Pencil, Reply, Trash } from 'lucide-react'
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react'
import toast from 'react-hot-toast'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ContextMenu,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui'

import { DeleteMessageDialog } from './DeleteMessageDialog'
import { MessageBubble } from './MessageBubble'
import { Message } from '@/types'

interface MessageItem {
  message: Message
  currentUserId: string
  showAvatar: boolean
  setEditing: Dispatch<SetStateAction<boolean>>
  setEditedText: Dispatch<SetStateAction<string>>
  setEditingId: Dispatch<SetStateAction<string>>
  deleteMessage: (messageId: string, forEveryone?: boolean) => void
  containerRef?: RefObject<HTMLDivElement | null>
  setReplyTo: Dispatch<SetStateAction<Message | undefined>>
  setForwardedFrom: Dispatch<SetStateAction<Message | undefined>>
}

export const MessageItem = ({
  message,
  currentUserId,
  showAvatar,
  setEditing,
  setEditedText,
  setEditingId,
  deleteMessage,
  containerRef,
  setReplyTo,
  setForwardedFrom
}: MessageItem) => {
  const [deletingMessage, setDeletingMessage] = useState<string | undefined>(
    undefined
  )
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom')
  const messageRef = useRef<HTMLDivElement>(null)

  const isOwn = message.sender?.id === currentUserId

  // Определяем позицию меню в зависимости от положения сообщения в контейнере
  useEffect(() => {
    if (messageRef.current && containerRef?.current) {
      const messageRect = messageRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      const messageBottom = messageRect.bottom - containerRect.top
      const containerHeight = containerRect.height

      // Если сообщение в нижней части контейнера (нижние 200px), меню открываем вверх
      if (containerHeight - messageBottom < 200) {
        setMenuPosition('top')
      } else {
        setMenuPosition('bottom')
      }
    }
  }, [message.id, containerRef])

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content || '')
    toast.success('Сообщение скопировано')
  }

  const handleDelete = (forEveryone: boolean) => {
    if (!deletingMessage) return
    deleteMessage(deletingMessage, forEveryone)
  }

  return (
    <>
      <div
        ref={messageRef}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex max-w-[70%] items-end gap-2 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {!isOwn && showAvatar && (
            <Avatar className='h-8 w-8 shrink-0'>
              <AvatarImage src={message.sender?.avatar} />
              <AvatarFallback>
                {message.sender?.firstName?.[0]}
                {message.sender?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Context menu */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  disabled={message.isSystem}
                >
                  <div className='inline-block cursor-pointer'>
                    <MessageBubble
                      currentUserId={currentUserId}
                      isOwn={isOwn}
                      message={message}
                      showAvatar={showAvatar}
                    />
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align={isOwn ? 'end' : 'start'}
                  side={menuPosition}
                  className='z-50'
                >
                  <DropdownMenuItem onClick={() => setReplyTo(message)}>
                    <Reply className='mr-2 h-4 w-4' />
                    Ответить
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setForwardedFrom(message)}>
                    <Forward className='mr-2 h-4 w-4' />
                    Переслать
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={copyMessage}>
                    <Copy className='mr-2 h-4 w-4' />
                    Копировать
                  </DropdownMenuItem>

                  {isOwn && (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(true)
                        setEditedText(message.content || '')
                        setEditingId(message.id)
                      }}
                    >
                      <Pencil className='mr-2 h-4 w-4' />
                      Редактировать
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className='text-red-500 focus:text-red-500'
                    onClick={() => setDeletingMessage(message.id)}
                  >
                    <Trash className='mr-2 h-4 w-4' />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ContextMenuTrigger>
          </ContextMenu>
        </div>
      </div>

      <DeleteMessageDialog
        open={!!deletingMessage}
        onOpenChange={() => setDeletingMessage(undefined)}
        onDelete={handleDelete}
        isOwn={isOwn}
      />
    </>
  )
}
