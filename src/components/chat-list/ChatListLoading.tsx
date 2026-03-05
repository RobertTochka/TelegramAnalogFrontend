import { Skeleton } from '@/components/ui'

export const ChatListLoading = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='border-b border-white/5 p-4'>
        <Skeleton className='h-10 w-full bg-slate-800' />
      </div>
      <div className='flex-1 space-y-4 p-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center space-x-3'
          >
            <Skeleton className='h-12 w-12 rounded-full bg-slate-800' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4 bg-slate-800' />
              <Skeleton className='h-3 w-1/2 bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
