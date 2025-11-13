import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'TON Next.js Starter',
  description: 'TON wallet integration demo (testnet) with dark UI',
}

import TonConnectProvider from '@/components/providers/TonConnectProvider'
import ToastProvider from '@/components/ui/ToastProvider'
import Header from '@/components/layout/Header'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-gem-900 text-white antialiased" suppressHydrationWarning>
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
