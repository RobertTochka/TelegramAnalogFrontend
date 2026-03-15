import { AlertTriangle, LogOut } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui'

import { EnumChatType } from '@/types'

interface LeaveChatConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  chatName: string
  chatType: string
}

export const LeaveChatConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  chatName,
  chatType
}: LeaveChatConfirmModalProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className='border-white/5 bg-slate-900 text-white sm:max-w-md'
      >
        <DialogHeader>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle className='h-6 w-6 text-red-400' />
          </div>
          <DialogTitle className='text-center text-xl'>
            Покинуть {chatType === EnumChatType.CHANNEL ? 'канал' : 'чат'}
          </DialogTitle>
          <DialogDescription className='text-center text-gray-400'>
            Вы уверены, что хотите покинуть{' '}
            {chatType === EnumChatType.CHANNEL ? 'канал' : 'чат'}{' '}
            <span className='font-semibold text-white'>
              &quot;{chatName}&quot;
            </span>
            ?
            <br />
            Вы потеряете доступ к истории сообщений.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex flex-col gap-2 sm:flex-row'>
          <Button
            variant='outline'
            className='flex-1 border-white/5 bg-slate-800 text-white hover:bg-slate-700'
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            variant='destructive'
            className='flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Покинуть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
