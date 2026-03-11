'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useChangePassword, useUpdateProfile } from '@/api/hooks/users'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Textarea
} from '@/components/ui'

import { Profile } from '@/types'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  username: z.string().optional(),
  email: z.string().email('Неверный формат email'),
  phone: z.string().optional(),
  description: z.string().optional()
})

const passwordSchema = z
  .object({
    oldPassword: z.string().optional(),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    passwordRepeat: z.string()
  })
  .refine(data => data.password === data.passwordRepeat, {
    message: 'Пароли не совпадают',
    path: ['passwordRepeat']
  })

interface ProfileSettingsProps {
  profile?: Profile
}

export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { updateProfile, isLoadingUpdate } = useUpdateProfile()
  const { changePassword, isLoadingChangePassword } = useChangePassword()
  const defaultValues = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    username: profile?.username || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    description: profile?.description || ''
  }

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      passwordRepeat: ''
    }
  })

  const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    if (
      values.description === defaultValues.description &&
      values.email === defaultValues.email &&
      values.firstName === defaultValues.firstName &&
      values.lastName === defaultValues.lastName &&
      values.phone === defaultValues.phone &&
      values.username === defaultValues.username
    )
      return

    updateProfile(
      Object.fromEntries(Object.entries(values).filter(([_, v]) => v !== ''))
    )
  }

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    changePassword(values, {
      onSuccess: () => {
        passwordForm.reset()
      }
    })
  }

  return (
    <div className='mb-10 space-y-6'>
      {/* Основная информация */}
      <Card className='border-white/5 bg-slate-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <User className='h-5 w-5 text-purple-400' />
            Основная информация
          </CardTitle>
          <CardDescription className='text-gray-400'>
            Измените свои личные данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className='space-y-4'
            >
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={profileForm.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-300'>Имя</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Введите имя'
                          className='border-white/5 bg-slate-900/50 text-white placeholder:text-gray-500'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-300'>Фамилия</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Введите фамилию'
                          className='border-white/5 bg-slate-900/50 text-white placeholder:text-gray-500'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>
                      Имя пользователя
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <AtSign className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                        <Input
                          {...field}
                          placeholder='username'
                          className='border-white/5 bg-slate-900/50 pl-9 text-white placeholder:text-gray-500'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>Email</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                        <Input
                          {...field}
                          type='email'
                          placeholder='email@example.com'
                          className='border-white/5 bg-slate-900/50 pl-9 text-white placeholder:text-gray-500'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled
                control={profileForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>Телефон</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Phone className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                        <Input
                          {...field}
                          placeholder='+7 (999) 999-99-99'
                          className='border-white/5 bg-slate-900/50 pl-9 text-white placeholder:text-gray-500'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>О себе</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder='Расскажите о себе...'
                        className='resize-none border-white/5 bg-slate-900/50 text-white placeholder:text-gray-500'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isLoadingUpdate}
                className='w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              >
                {isLoadingUpdate ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className='bg-white/5' />

      {/* Смена пароля */}
      <Card className='border-white/5 bg-slate-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Lock className='h-5 w-5 text-purple-400' />
            Безопасность
          </CardTitle>
          <CardDescription className='text-gray-400'>
            Измените свой пароль
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className='space-y-4'
            >
              {profile?.isPasswordEnabled && (
                <FormField
                  control={passwordForm.control}
                  name='oldPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-300'>
                        Старый пароль
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            {...field}
                            type={showOldPassword ? 'text' : 'password'}
                            placeholder='Введите старый пароль'
                            className='border-white/5 bg-slate-900/50 pr-9 text-white placeholder:text-gray-500'
                          />
                          <button
                            type='button'
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className='absolute top-1/2 right-3 -translate-y-1/2'
                          >
                            {showOldPassword ? (
                              <EyeOff className='h-4 w-4 text-gray-500' />
                            ) : (
                              <Eye className='h-4 w-4 text-gray-500' />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={passwordForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>
                      Новый пароль
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Введите новый пароль'
                          className='border-white/5 bg-slate-900/50 pr-9 text-white placeholder:text-gray-500'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute top-1/2 right-3 -translate-y-1/2'
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4 text-gray-500' />
                          ) : (
                            <Eye className='h-4 w-4 text-gray-500' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name='passwordRepeat'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-300'>
                      Подтвердите пароль
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='Повторите пароль'
                          className='border-white/5 bg-slate-900/50 pr-9 text-white placeholder:text-gray-500'
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className='absolute top-1/2 right-3 -translate-y-1/2'
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4 text-gray-500' />
                          ) : (
                            <Eye className='h-4 w-4 text-gray-500' />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isLoadingChangePassword}
                className='w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              >
                {isLoadingChangePassword
                  ? 'Смена пароля...'
                  : 'Изменить пароль'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
