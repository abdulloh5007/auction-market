"use client"

import { useCallback, useEffect, useState } from 'react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { fetchTonBalance } from '@/lib/fetchTonBalance'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const wallet = useTonWallet()
  const userFriendlyAddress = useTonAddress()
  const [tonConnectUI] = useTonConnectUI()
  const [balance, setBalance] = useState<number | null>(null)
  const [balErr, setBalErr] = useState<string | null>(null)
  const [loadingBal, setLoadingBal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const loadBalance = useCallback(async () => {
    if (!wallet || !userFriendlyAddress) return
    try {
      setLoadingBal(true)
      const b = await fetchTonBalance(userFriendlyAddress, 'testnet')
      setBalance(b)
      setBalErr(null)
    } catch (e: any) {
      setBalErr('Balance unavailable')
      setBalance(null)
    } finally {
      setLoadingBal(false)
    }
  }, [wallet, userFriendlyAddress])

  useEffect(() => {
    loadBalance()
    if (!wallet) return
    const id = setInterval(loadBalance, 60000)
    return () => clearInterval(id)
  }, [loadBalance, wallet])

  const onClickConnect = useCallback(async () => {
    if (wallet) {
      await tonConnectUI.disconnect()
      setBalance(null)
      return
    }
    tonConnectUI.openModal()
  }, [tonConnectUI, wallet])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo и брендинг */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 grid place-items-center shadow-lg group-hover:shadow-accent-500/25 transition-all duration-300">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 opacity-75 blur group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  TON Market
                </h1>
                <p className="text-xs text-accent-300 font-medium">NFT Marketplace</p>
              </div>
            </Link>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === '/' 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Главная
            </Link>
            <Link 
              href="/profile" 
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === '/profile' 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Профиль
            </Link>
          </nav>

          {/* Правая часть */}
          <div className="flex items-center gap-3">
            {/* Кнопка подключения кошелька */}
            <button 
              onClick={onClickConnect}
              className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                wallet 
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                  : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-400 hover:to-accent-500 shadow-lg hover:shadow-accent-500/25'
              }`}
            >
              {wallet ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Отключить</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Подключить</span>
                </div>
              )}
              {!wallet && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-400 to-accent-600 opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
              )}
            </button>

            {/* Мобильное меню */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-2">
            <Link 
              href="/" 
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
            <Link 
              href="/profile" 
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/profile' 
                  ? 'text-white' 
                  : 'text-white/70 hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Профиль
            </Link>
            {wallet && (
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-white/70">Кошелек подключен</span>
                </div>
                <div className="text-xs text-white/60 font-mono mb-1">
                  {formatAddress(userFriendlyAddress)}
                </div>
                <div className="text-xs font-semibold text-accent-300">
                  {loadingBal ? 'Загрузка...' : balance !== null ? `${balance.toFixed(3)} TON` : balErr || 'Ошибка'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
