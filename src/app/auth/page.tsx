'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { useLogin, useRegister, useVerify } from '@/api/hooks/auth'

import { LoginForm, RegisterForm, VerifyCodeForm } from '@/components/auth'

import { APP_NAME } from '@/constants'

export default function LoginPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [isRegister, setIsRegister] = useState(false)

  const { register, isLoadingRegister } = useRegister()
  const { login, isLoadingLogin } = useLogin()
  const { verify, isLoadingVerify } = useVerify()

  const handleRegister = async (values: {
    email: string
    firstName: string
    lastName: string
  }) => {
    try {
      register(values)
      setEmail(values.email)
    } catch (error) {
      console.error('Send code error:', error)
    }
  }
  const handleLogin = async (values: { email: string }) => {
    try {
      login(values)
      setEmail(values.email)
    } catch (error) {
      console.error('Send code error:', error)
    }
  }

  const handleVerifyCode = async (values: { code: string }) => {
    try {
      if (!email) throw new Error('Вы не указали email')
      const data = { email, ...values }
      verify(data)
    } catch (error) {
      console.error('Verify code error:', error)
    }
  }

  const handleBack = () => {
    setEmail(null)
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950'>
      {/* Анимированные фоновые элементы */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000' />
        <div className='absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl' />

        {/* Сетка */}
        <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-20' />
      </div>

      {/* Хедер */}
      <div className='absolute top-8 left-8 z-10 flex items-center gap-3'>
        <div className='relative'>
          <div className='absolute inset-0 animate-pulse rounded-lg bg-linear-to-r from-purple-600 to-blue-600 blur-sm' />
          <div className='relative rounded-lg bg-linear-to-r from-purple-600 to-blue-600 p-2'>
            <MessageCircle className='h-6 w-6 text-white' />
          </div>
        </div>
        <span className='bg-linear-to-r from-white to-gray-400 bg-clip-text text-2xl font-bold text-transparent'>
          {APP_NAME}
        </span>
      </div>

      {/* Основной контент */}
      <div className='relative flex min-h-screen items-center justify-center px-4 py-12'>
        <div className='absolute inset-0 bg-linear-to-t from-slate-950/50 to-transparent' />

        <div className='relative w-full max-w-md'>
          {/* Декоративный элемент */}
          <div className='absolute -inset-1 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 opacity-20 blur-xl' />

          {!email ? (
            isRegister ? (
              <RegisterForm
                onSubmit={handleRegister}
                isLoading={isLoadingRegister}
                setIsRegister={setIsRegister}
              />
            ) : (
              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoadingLogin}
                setIsRegister={setIsRegister}
              />
            )
          ) : (
            <VerifyCodeForm
              email={email}
              onSubmit={handleVerifyCode}
              onBack={handleBack}
              isLoading={isLoadingVerify}
            />
          )}
        </div>
      </div>

      {/* Футер */}
      <div className='absolute right-0 bottom-8 left-0 text-center'>
        <p className='text-sm text-gray-500'>
          © 2026 {APP_NAME}. Все права защищены.
        </p>
      </div>
    </div>
  )
}
