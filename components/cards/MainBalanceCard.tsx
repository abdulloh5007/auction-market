"use client"

import { useEffect, useMemo, useState } from 'react'
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react'

export default function MainBalanceCard() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [rates, setRates] = useState<Record<'USD'|'EUR'|'RUB'|'UZS', number>>({} as any)
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'RUB' | 'UZS'>('USD')
  const [mounted, setMounted] = useState(false)
  const [tonBalance, setTonBalance] = useState<number | null>(null)
  const wallet = useTonWallet()
  const address = useTonAddress()

  const mainAmount = useMemo(() => {
    if (tonBalance === null) return null
    const rate = rates[selectedCurrency] || 0
    return tonBalance * rate
  }, [tonBalance, selectedCurrency, rates])

  const format = (amount: number, currency: 'USD' | 'EUR' | 'RUB' | 'UZS') => {
    const map: Record<'USD'|'EUR'|'RUB'|'UZS', Intl.NumberFormatOptions> = {
      USD: { style: 'currency', currency: 'USD' },
      EUR: { style: 'currency', currency: 'EUR' },
      RUB: { style: 'currency', currency: 'RUB' },
      UZS: { style: 'currency', currency: 'UZS' },
    }
    const locales: Record<'USD'|'EUR'|'RUB'|'UZS', string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      RUB: 'ru-RU',
      UZS: 'uz-UZ',
    }
    return new Intl.NumberFormat(locales[currency], map[currency]).format(amount)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let timer: any
    const load = async () => {
      try {
        setLoading(true)
        // Prices
        const response = await fetch('/api/ton-prices?currencies=usd,eur,rub,uzs')
        const data = await response.json()
        const prices = data.prices || {}
        const normalized = {
          USD: prices.usd ?? 0,
          EUR: prices.eur ?? 0,
          RUB: prices.rub ?? 0,
          UZS: prices.uzs ?? (prices.usd ? prices.usd * 32000 : 0),
        }
        setRates(normalized as any)
        setPrice(normalized.USD)

        // Testnet TON balance
        if (wallet && address) {
          try {
            const balRes = await fetch(`/api/balance?address=${address}&chain=testnet`)
            const balJson = await balRes.json()
            setTonBalance(typeof balJson.balance === 'number' ? balJson.balance : 0)
          } catch {
            setTonBalance(0)
          }
        } else {
          setTonBalance(null)
        }

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
  }, [wallet, address])

  //

  return (
    <div className="mx-auto w-full">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0c98ff] via-[#4cc3ff] to-[#9ad8ff] text-white shadow-xl relative overflow-hidden">

        {/* Главный баланс */}
        <div className="flex items-center justify-center gap-2">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums drop-shadow">
            {!mounted ? '—' : (mainAmount !== null ? format(mainAmount, selectedCurrency) : '—')}
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="rounded-full bg-white/30 hover:bg-white/40 transition-colors p-2"
            aria-label="Toggle details"
          >
            <svg className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Единый блок валют */}
        <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="rounded-xl bg-white/25 backdrop-blur text-ink-900/90 font-medium flex flex-col">

            {/* USD */}
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`w-full flex justify-between px-4 py-3 transition-all hover:bg-white/10 active:scale-95 rounded-t-xl ${selectedCurrency==='USD'?'bg-white/20':''}`}
            >
              <span>USD</span>
              <span>{mounted && tonBalance !== null && rates['USD'] ? format(tonBalance*rates['USD'], 'USD') : '—'}</span>
            </button>

            {/* EUR */}
            <button
              onClick={() => setSelectedCurrency('EUR')}
              className={`w-full flex justify-between px-4 py-3 transition-all hover:bg-white/10 active:scale-95 ${selectedCurrency==='EUR'?'bg-white/20':''}`}
            >
              <span>EUR</span>
              <span>{mounted && tonBalance !== null && rates['EUR'] ? format(tonBalance*rates['EUR'], 'EUR') : '—'}</span>
            </button>

            {/* RUB */}
            <button
              onClick={() => setSelectedCurrency('RUB')}
              className={`w-full flex justify-between px-4 py-3 transition-all hover:bg-white/10 active:scale-95 ${selectedCurrency==='RUB'?'bg-white/20':''}`}
            >
              <span>RUB</span>
              <span>{mounted && tonBalance !== null && rates['RUB'] ? format(tonBalance*rates['RUB']!, 'RUB') : '—'}</span>
            </button>

            {/* UZS */}
            <button
              onClick={() => setSelectedCurrency('UZS')}
              className={`w-full flex justify-between px-4 py-3 transition-all hover:bg-white/10 active:scale-95 rounded-b-xl ${selectedCurrency==='UZS'?'bg-white/20':''}`}
            >
              <span>UZS</span>
              <span>{mounted && tonBalance !== null && rates['UZS'] ? format(tonBalance*rates['UZS']!, 'UZS') : '—'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
