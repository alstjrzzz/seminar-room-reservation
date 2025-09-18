import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FloatingAdminButton } from '@/components/FloatingAdminButton'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '세미나실 예약 시스템',
  description: '세미나실 예약 관리 시스템입니다.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="csrf-token" content="your-csrf-token-here" />
      </head>
      <body className={inter.className}>
        {children}
        <FloatingAdminButton />
        <Toaster />
      </body>
    </html>
  )
}
