"use client"

import { useEffect, useState } from 'react'
import { fetchTonPrice } from '@/lib/fetchTonPrice'

export default function TonPriceCard() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: any
    const load = async () => {
      try {
        setLoading(true)
        const p = await fetchTonPrice()
        setPrice(p)
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch TON price')
      } finally {
        setLoading(false)
      }
    }
    load()
    timer = setInterval(load, 45000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="card-glass p-5 flex items-center justify-between">
      <div>
        <div className="text-white/60 text-sm">TON Price</div>
        <div className="text-2xl font-semibold mt-1">
          {loading && 'Loading...'}
          {!loading && price !== null && `$${price.toFixed(3)}`}
          {!loading && price === null && '—'}
        </div>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
    </div>
  )
}
