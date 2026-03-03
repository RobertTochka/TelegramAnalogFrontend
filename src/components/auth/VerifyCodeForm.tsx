'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { ClipboardEvent, FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
  FormMessage,
  Input
} from '../ui'

const formSchema = z.object({
  code: z
    .string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d+$/, 'Только цифры')
})

type FormValues = z.infer<typeof formSchema>

interface VerifyCodeFormProps {
  email: string
  onSubmit: (values: FormValues) => void
  onBack: () => void
  isLoading?: boolean
}

export const VerifyCodeForm: FC<VerifyCodeFormProps> = ({
  email,
  onSubmit,
  onBack,
  isLoading = false
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ''
    }
  })

  const { setValue, watch } = form
  const codeValue = watch('code')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const updateInputsFromCode = (code: string) => {
    const cleanCode = code.slice(0, 6).replace(/\D/g, '')
    setValue('code', cleanCode)

    for (let i = 0; i < 6; i++) {
      const input = inputRefs.current[i]
      if (input) {
        input.value = cleanCode[i] || ''
      }
    }

    if (cleanCode.length === 6) {
      inputRefs.current[5]?.focus()
    } else {
      inputRefs.current[cleanCode.length]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const digits = pastedText.replace(/\D/g, '')

    if (digits) {
      updateInputsFromCode(digits)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const newCode = value.slice(0, 6)
      setValue('code', newCode)

      for (let i = 0; i < 6; i++) {
        const input = inputRefs.current[i]
        if (input) {
          input.value = newCode[i] || ''
        }
      }

      inputRefs.current[5]?.focus()
    } else {
      const inputs = inputRefs.current
      if (inputs[index]) {
        inputs[index]!.value = value
      }

      const fullCode = inputs.map(input => input?.value || '').join('')
      setValue('code', fullCode)

      if (value && index < 5) {
        inputs[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      const inputs = inputRefs.current
      if (!inputs[index]?.value && index > 0) {
        inputs[index - 1]?.focus()
      }
    }
  }

  return (
    <Card className='border-0 bg-slate-900/90 backdrop-blur-xl'>
      <CardHeader className='space-y-1 px-4 pt-6 sm:px-6'>
        <div className='flex items-center'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='mr-1 -ml-2 text-gray-400 transition-colors hover:bg-slate-800 hover:text-white sm:mr-2'
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <CardTitle className='bg-linear-to-r from-white to-gray-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl'>
            Подтверждение
          </CardTitle>
        </div>
        <CardDescription className='text-sm text-gray-400 sm:text-base'>
          Введите код, отправленный на{' '}
          <span className='block font-semibold break-all text-purple-400 sm:inline'>
            {email}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-4 pb-6 sm:px-6'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className='flex justify-between gap-1 sm:gap-2'
                      onPaste={handlePaste}
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Input
                          key={index}
                          type='text'
                          inputMode='numeric'
                          pattern='[0-9]*'
                          maxLength={6}
                          className={`h-12 w-12 border-gray-700 bg-slate-800/50 text-center text-lg font-semibold text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${isMobile ? 'sm:h-14 sm:w-14 sm:text-xl' : ''} ${index === 0 ? 'rounded-l-lg' : ''} ${index === 5 ? 'rounded-r-lg' : ''} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                          defaultValue={field.value[index] || ''}
                          onChange={e =>
                            handleCodeChange(index, e.target.value)
                          }
                          onKeyDown={e => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          ref={el => {
                            inputRefs.current[index] = el
                          }}
                          disabled={isLoading}
                          autoComplete='off'
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className='text-center text-xs text-red-400 sm:text-sm' />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className={`relative w-full overflow-hidden bg-linear-to-r from-purple-600 to-blue-600 text-white transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 ${isMobile ? 'py-6 text-base' : ''} `}
              disabled={isLoading || codeValue.length !== 6}
            >
              <span className='relative z-10 flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Проверка...
                  </>
                ) : (
                  <>
                    Подтвердить
                    <Check className='ml-2 h-4 w-4' />
                  </>
                )}
              </span>
            </Button>

            {isMobile && codeValue.length !== 6 && (
              <p className='text-center text-xs text-gray-500'>
                Введите 6-значный код из письма
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
