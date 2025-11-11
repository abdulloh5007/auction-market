import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'TON Next.js Starter',
  description: 'TON wallet integration demo (testnet) with dark UI',
}

import TonConnectProvider from '@/components/TonConnectProvider'
import ToastProvider from '@/components/ToastProvider'
import Header from '@/components/Header'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-900 text-white antialiased">
        <ToastProvider>
          <TonConnectProvider>
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-6">
              {children}
            </div>
          </TonConnectProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
