"use client"

import { ReactNode, useMemo } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

export default function TonConnectProvider({ children }: { children: ReactNode }) {
  const manifestUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL || '/tonconnect-manifest.json'
  }, [])

  if (!manifestUrl) return <>{children}</>

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  )
}
