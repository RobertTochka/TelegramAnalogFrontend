'use client'

import { Camera, ChevronRight, LogOut, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useLogout } from '@/api/hooks/auth'
import { useGetProfile } from '@/api/hooks/users'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui'

import { FriendsTab } from './FriendsTab'
import { ProfileSettings } from './ProfileSettings'

export const MainProfile = () => {
  const router = useRouter()
  const { profile, isLoadingProfile } = useGetProfile()
  const { logout } = useLogout()
  const [activeTab, setActiveTab] = useState('profile')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Здесь будет логика загрузки аватара
      const formData = new FormData()
      formData.append('avatar', file)
      // updateProfile({ avatar: file })
    }
  }

  if (isLoadingProfile) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
        <div className='relative'>
          <div className='absolute inset-0 animate-pulse rounded-full bg-linear-to-r from-purple-600/20 to-blue-600/20 blur-xl' />
          <div className='relative h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-purple-500' />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
        <Card className='border-white/5 bg-slate-800/50 p-8 text-center'>
          <p className='text-gray-400'>Пользователь не найден</p>
          <Button
            onClick={() => router.back()}
            className='mt-4 bg-linear-to-r from-purple-600 to-blue-600 text-white'
          >
            Вернуться назад
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-900 via-slate-900 to-slate-800'>
      {/* Шапка профиля */}
      <div className='relative h-48 bg-linear-to-r from-purple-600/20 to-blue-600/20'>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />

        {/* Кнопка назад */}
        <Link
          href='/'
          className='absolute top-4 left-4 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30'
        >
          <ChevronRight className='h-5 w-5 rotate-180 text-white' />
        </Link>

        {/* Кнопка выхода */}
        <button
          onClick={() => logout()}
          className='absolute top-4 right-4 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30'
        >
          <LogOut className='h-5 w-5 text-white' />
        </button>
      </div>

      {/* Основной контент с шириной 640px */}
      <div className='relative mx-auto max-w-160 px-4'>
        {/* Аватар */}
        <div className='absolute -top-16 left-1/2 -translate-x-1/2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='group absolute -top-20 left-1/2 -translate-x-1/2 cursor-pointer'>
                <div className='absolute inset-0 rounded-full bg-linear-to-r from-purple-600 to-blue-600 opacity-75 blur-xl transition-opacity group-hover:opacity-100' />
                <Avatar className='relative h-32 w-32 border-4 border-slate-800'>
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className='bg-linear-to-br from-purple-600 to-blue-600 text-4xl font-bold text-white'>
                    {profile?.firstName?.[0]}
                    {profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera className='h-6 w-6 text-white' />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='center'
              className='w-48'
            >
              <DropdownMenuItem
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
              >
                <Camera className='mr-2 h-4 w-4' />
                Загрузить фото
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-500'>
                Удалить фото
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            id='avatar-upload'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleAvatarChange}
          />
        </div>

        {/* Имя пользователя */}
        <div className='mt-20 text-center'>
          <h1 className='text-2xl font-bold text-white'>
            {profile?.firstName} {profile?.lastName}
          </h1>
          {profile?.username && (
            <p className='mt-1 text-sm text-gray-400'>@{profile.username}</p>
          )}
          {profile?.description && (
            <p className='mx-auto mt-2 max-w-md px-4 text-sm text-gray-300'>
              {profile.description}
            </p>
          )}
        </div>

        {/* Табы */}
        <div className='mt-8'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='w-full bg-slate-800/50 p-1'>
              <TabsTrigger
                value='profile'
                className='flex-1 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
              >
                <Settings className='mr-2 h-4 w-4' />
                Настройки
              </TabsTrigger>
              <TabsTrigger
                value='friends'
                className='flex-1 data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white'
              >
                <Users className='mr-2 h-4 w-4' />
                Друзья
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value='profile'
              className='mt-6'
            >
              <ProfileSettings profile={profile} />
            </TabsContent>

            <TabsContent
              value='friends'
              className='mt-6'
            >
              <FriendsTab currentUserId={profile?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
