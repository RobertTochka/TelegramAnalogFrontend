'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useLogout } from '@/api/hooks/auth'

import { Button } from '@/components/ui'

import { APP_NAME } from '@/constants'

export default function ChatsPage() {
  const router = useRouter()

  const { logout, isLoadingLogout } = useLogout()

  const handleLogout = async () => {
    try {
      logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className='flex h-screen bg-[#0E1621]'>
      {/* Боковая панель */}
      <div className='w-100 border-r border-[#2B3A47] bg-[#17212B]'>
        <div className='flex items-center justify-between border-b border-[#2B3A47] p-4'>
          <h2 className='font-semibold text-white'>Чаты</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            disabled={isLoadingLogout}
            className='text-gray-400 hover:bg-[#2B3A47] hover:text-white'
          >
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
        <div className='p-4 text-center text-gray-400'>
          Список чатов будет здесь
        </div>
      </div>

      {/* Основная область чата */}
      <div className='flex flex-1 items-center justify-center bg-[#0E1621]'>
        <div className='text-center'>
          <h3 className='mb-2 text-xl text-white'>
            Добро пожаловать в {APP_NAME}
          </h3>
          <p className='text-gray-400'>Выберите чат для начала общения</p>
        </div>
      </div>
    </div>
  )
}
