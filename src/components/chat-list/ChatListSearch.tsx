import { Search } from 'lucide-react'
import { SetStateAction } from 'react'

import { Input } from '@/components/ui'

interface SearchChatListProps {
  searchQuery: string
  setSearchQuery: (value: SetStateAction<string>) => void
}

export const ChatListSearch = ({
  searchQuery,
  setSearchQuery
}: SearchChatListProps) => {
  return (
    <div className='border-b border-white/5 p-4'>
      <div className='group relative'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400' />
        <Input
          type='text'
          placeholder='Поиск чатов...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='border-white/5 bg-slate-800/50 pl-9 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
        />
      </div>
    </div>
  )
}
