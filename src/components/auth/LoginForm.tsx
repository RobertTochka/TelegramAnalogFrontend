'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { Dispatch, FC, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '../ui'

const formSchema = z.object({
  email: z.string().email('Введите корректный email адрес')
})

type FormValues = z.infer<typeof formSchema>

interface LoginFormProps {
  onSubmit: (values: FormValues) => void
  setIsRegister: Dispatch<SetStateAction<boolean>>
  isLoading?: boolean
}

export const LoginForm: FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  setIsRegister
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  return (
    <Card className='border-0 bg-slate-900/90 backdrop-blur-xl'>
      <CardHeader className='space-y-1'>
        <CardTitle className='bg-linear-to-r from-white to-gray-400 bg-clip-text text-center text-3xl font-bold text-transparent'>
          Вход в аккаунт
        </CardTitle>
        <CardDescription className='text-center text-gray-400'>
          Введите ваши данные для входа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-gray-300'>Почта</FormLabel>
                  <FormControl>
                    <div className='group relative'>
                      <Mail className='absolute top-2.5 left-3 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-purple-400' />
                      <Input
                        placeholder='ivan@example.com'
                        className='border-gray-700 bg-slate-800/50 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        {...field}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs text-red-400' />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='relative w-full overflow-hidden bg-linear-to-r from-purple-600 to-blue-600 text-white transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25'
              disabled={isLoading}
            >
              <span className='relative z-10 flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Отправка...
                  </>
                ) : (
                  <>
                    Отправить код
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </>
                )}
              </span>
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col gap-2'>
        <p className='text-sm text-gray-500'>
          Мы отправим 6-значный код на вашу почту
        </p>
        <button
          className='text-sm text-gray-400 transition-colors hover:text-purple-400'
          onClick={() => setIsRegister(true)}
        >
          Еще нет аккаунта?{' '}
          <span className='font-semibold text-purple-400'>
            Зарегистрироваться
          </span>
        </button>
      </CardFooter>
    </Card>
  )
}
