import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../ui'

interface DeleteMessageDialogProps {
  open: boolean
  isOwn: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (forEveryone: boolean) => void
}

export const DeleteMessageDialog = ({
  open,
  isOwn,
  onOpenChange,
  onDelete
}: DeleteMessageDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-100'>
        <DialogHeader>
          <DialogTitle>Удалить сообщение?</DialogTitle>
        </DialogHeader>

        <div className='text-muted-foreground text-sm'>
          Вы можете удалить сообщение только у себя или у всех участников чата.
        </div>

        <DialogFooter className='flex gap-2 sm:justify-end'>
          <Button
            variant='outline'
            onClick={() => onDelete(false)}
          >
            Удалить для меня
          </Button>

          {isOwn && (
            <Button
              variant='destructive'
              onClick={() => onDelete(true)}
            >
              Удалить для всех
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
