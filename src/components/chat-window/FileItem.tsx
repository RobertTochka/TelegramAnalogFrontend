import { X } from 'lucide-react'

import { Button } from '@/components/ui'

interface FileItemProps {
  file: File
  removeFile: () => void
}

export const FileItem = ({ file, removeFile }: FileItemProps) => {
  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0]
    switch (type) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      default:
        return '📎'
    }
  }

  return (
    <div className='group relative flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2'>
      <span className='text-lg'>{getFileIcon(file)}</span>
      <div className='max-w-50'>
        <p className='truncate text-xs text-white'>{file.name}</p>
        <p className='text-xs text-gray-400'>
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-slate-700 opacity-0 transition-opacity group-hover:opacity-100'
        onClick={removeFile}
      >
        <X className='h-3 w-3' />
      </Button>
    </div>
  )
}
