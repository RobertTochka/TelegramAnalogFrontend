import { Metadata } from 'next'

import './globals.css'
import { Providers } from './providers'
import { APP_NAME } from '@/constants'

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Мессенджер в стиле Telegram'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
