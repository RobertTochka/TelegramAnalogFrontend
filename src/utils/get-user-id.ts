import { parse } from 'cookie'

import { api } from '@/api/api'

export const getUserId = async () => {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    const res = await api.get<string>('users/me')
    const userId = res.data

    if (!userId) throw new Error('Пользователь не авторизован')

    return userId
  } else {
    const cookies = document.cookie

    if (!cookies) throw new Error('Cookies не найдены')

    const parsedCookies = parse(cookies)
    let sessionId = parsedCookies['session']

    if (!sessionId) throw new Error('Пользователь не авторизован')

    if (sessionId.startsWith('s:')) {
      sessionId = sessionId.substring(2)
    }

    const dotIndex = sessionId.indexOf('.')
    if (dotIndex !== -1) {
      sessionId = sessionId.substring(0, dotIndex)
    }

    return sessionId
  }
}
