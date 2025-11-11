"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { fetchTonBalance } from '@/lib/fetchTonBalance'
import { fetchTonPrice } from '@/lib/fetchTonPrice'

import MainBalanceCard from '@/components/MainBalanceCard'
import TopBalanceStrip from '@/components/TopBalanceStrip'

export default function ProfilePage() {
  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()
  const address = useTonAddress()
  const [balanceTon, setBalanceTon] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const usd = useMemo(() => (price !== null && balanceTon !== null ? price * balanceTon : null), [price, balanceTon])

  const load = useCallback(async () => {
    if (!address) return
    try {
      setLoading(true)
      const [b, p] = await Promise.all([
        fetchTonBalance(address, 'testnet'),
        fetchTonPrice(),
      ])
      setBalanceTon(b)
      setPrice(p)
    } catch (e) {
      // noop
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    load()
    if (!address) return
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [address, load])

  const onConnect = useCallback(() => tonConnectUI.openModal(), [tonConnectUI])
  const onDisconnect = useCallback(() => tonConnectUI.disconnect(), [tonConnectUI])

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-start gap-6 text-center px-4 py-6">
      <div className="w-full max-w-2xl">
        <MainBalanceCard />
      </div>
      <div className="w-full max-w-2xl">
        <TopBalanceStrip />
      </div>
    </main>
  )
}
