'use client'

import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { Paperclip, Send, Smile } from 'lucide-react'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
  Button,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui'

interface InputFormProps {
  messageText: string
  setMessageText: Dispatch<SetStateAction<string>>
  onSend: () => void
  attachedFiles: File[]
  setAttachedFiles: Dispatch<SetStateAction<File[]>>
  editMessage: (messageId: string, content: string) => void
  sendTyping: (isTyping: boolean) => void
  editing: boolean
  editedText: string
  setEditedText: Dispatch<SetStateAction<string>>
  setEditing: Dispatch<SetStateAction<boolean>>
  editingId: string
}

export const InputForm = ({
  messageText,
  setMessageText,
  onSend,
  attachedFiles,
  setAttachedFiles,
  editMessage,
  sendTyping,
  editing,
  editedText,
  setEditedText,
  setEditing,
  editingId
}: InputFormProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (editing) setMessageText(editedText)
  }, [editing, editedText])

  const handleEditMessage = () => {
    if (!messageText.trim() && attachedFiles.length === 0) return
    if (messageText === editedText) {
      setMessageText('')
      setEditedText('')
      setEditing(false)
      setAttachedFiles([])
      return
    }

    editMessage(editingId, messageText)

    setMessageText('')
    setEditedText('')
    setEditing(false)
    setAttachedFiles([])
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessageText(value)

    if (!editing) sendTyping(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      if (editing) {
        handleEditMessage()
      } else {
        onSend()
      }
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
    setShowFileMenu(false)
  }

  return (
    <div className='border-t border-white/5 bg-slate-900/50 p-4 backdrop-blur-sm'>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Input
            type='text'
            value={messageText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder='Введите сообщение...'
            className='w-full border-white/5 bg-slate-800/50 pr-20 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
          />

          {/* Кнопки смайликов и вложений */}
          <div className='absolute top-1/2 right-2 flex -translate-y-1/2 gap-1'>
            {/* Кнопка смайликов */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-gray-400 hover:bg-slate-700 hover:text-white'
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='border-white/5 bg-slate-800 text-white'
              >
                <p>Добавить смайлик</p>
              </TooltipContent>
            </Tooltip>

            {/* Кнопка вложений */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-gray-400 hover:bg-slate-700 hover:text-white'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='border-white/5 bg-slate-800 text-white'
              >
                <p>Прикрепить файл</p>
              </TooltipContent>
            </Tooltip>

            {/* Скрытый input для файлов */}
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              multiple
              onChange={handleFileSelect}
            />
          </div>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className='absolute right-0 bottom-full z-50 mb-2'
            >
              <div className='overflow-hidden rounded-xl border border-white/5 bg-slate-900 shadow-2xl'>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  lazyLoadEmojis
                  theme={Theme.DARK}
                  searchPlaceholder='Поиск смайликов...'
                  width={320}
                  height={400}
                />
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={editing ? handleEditMessage : onSend}
          disabled={!messageText.trim() && attachedFiles.length === 0}
          className='bg-linear-to-r from-purple-600 to-blue-600 text-white transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50'
        >
          <Send className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
