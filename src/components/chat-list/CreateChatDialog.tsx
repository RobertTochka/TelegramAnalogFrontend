'use client'

import { Loader2, Radio, Users } from 'lucide-react'
import { useState } from 'react'

import { useCreateChat } from '@/api/hooks/chat'

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label
} from '../ui'

import { CreateChatDto, EnumChatType } from '@/types'

interface Props {
  trigger: React.ReactNode
  onCreated?: (chatId: string) => void
}

export const CreateChatDialog = ({ trigger, onCreated }: Props) => {
  const { createChat, isLoadingCreate } = useCreateChat()

  const [open, setOpen] = useState(false)

  const [type, setType] = useState<EnumChatType>(EnumChatType.GROUP)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const [error, setError] = useState('')

  const validate = () => {
    if (!name.trim()) {
      setError('Введите название')
      return false
    }

    if (name.length < 3) {
      setError('Название должно быть минимум 3 символа')
      return false
    }

    setError('')
    return true
  }

  const handleCreate = () => {
    if (!validate()) return

    const payload: CreateChatDto = {
      name,
      type,
      isPrivate,
      participantIds: []
    }

    createChat(payload, {
      onSuccess: chat => {
        setOpen(false)
        setName('')
        setError('')
        onCreated?.(chat.id)
      }
    })
  }

  const isChannel = type === EnumChatType.CHANNEL

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='border-white/10 bg-slate-900 text-white backdrop-blur-xl'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>
            Создать чат
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-5'>
          {/* Выбор типа */}
          <div className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => setType(EnumChatType.GROUP)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                type === EnumChatType.GROUP
                  ? 'border-purple-500 bg-purple-600/20'
                  : 'border-white/10 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Users size={18} />
              Чат
            </button>

            <button
              onClick={() => setType(EnumChatType.CHANNEL)}
              className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition ${
                type === EnumChatType.CHANNEL
                  ? 'border-purple-500 bg-purple-600/20'
                  : 'border-white/10 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Radio size={18} />
              Канал
            </button>
          </div>

          {/* Название */}
          <div className='space-y-2'>
            <Label>Название</Label>

            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isChannel ? 'Название канала' : 'Название группы'}
              className='border-white/10 bg-slate-800'
            />

            {error && <p className='text-xs text-red-400'>{error}</p>}
          </div>

          {/* Приватность */}
          <div className='flex items-center justify-between rounded-lg border border-white/10 bg-slate-800 p-3'>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>
                Приватный {isChannel ? 'канал' : 'чат'}
              </span>

              <span className='text-xs text-gray-400'>
                Доступ только по приглашению
              </span>
            </div>

            <Checkbox
              checked={isPrivate}
              onCheckedChange={v => setIsPrivate(!!v)}
              className='border-white/20 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600'
            />
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button
            onClick={handleCreate}
            disabled={isLoadingCreate}
            className='w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          >
            {isLoadingCreate ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              'Создать'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
