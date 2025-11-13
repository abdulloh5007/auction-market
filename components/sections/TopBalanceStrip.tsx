"use client"

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react'
import { Address, fromNano } from '@ton/core'
import { TonClient } from '@ton/ton'

const UZS_MASTER = 'kQCGtwK2NaCpc7QHAHsrWIAQSC6wfk_XmnXY1nnhXaVPiaPQ'

// Добавьте ваш API ключ от https://toncenter.com или https://tonconsole.com
const TONCENTER_API_KEY = process.env.NEXT_PUBLIC_TONCENTER_API_KEY || ''

// Функция для получения баланса жетона
async function fetchJettonBalance(walletAddress: string, jettonMasterAddress: string, isTestnet = true): Promise<number> {
  try {
    const endpoint = isTestnet
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC'

    const client = new TonClient({
      endpoint,
      apiKey: TONCENTER_API_KEY
    })

    const userAddress = Address.parse(walletAddress)
    const masterAddress = Address.parse(jettonMasterAddress)

    // Получаем адрес кошелька жетонов пользователя через get-метод
    const response = await client.runMethod(masterAddress, 'get_wallet_address', [
      {
        type: 'slice',
        cell: (await import('@ton/core')).beginCell().storeAddress(userAddress).endCell()
      }
    ])

    const jettonWalletAddress = response.stack.readAddress()

    // Получаем данные кошелька жетонов через get-метод get_wallet_data
    const jettonData = await client.runMethod(jettonWalletAddress, 'get_wallet_data')

    // Читаем баланс (первое значение в стеке)
    const balance = jettonData.stack.readBigNumber()

    // Конвертируем из нано-жетонов в полные жетоны
    return parseFloat(fromNano(balance))
  } catch (error) {
    console.error('Error fetching jetton balance:', error)
    return 0
  }
}

// Функция для получения баланса TON
async function fetchTonBalance(walletAddress: string, isTestnet = true): Promise<number> {
  try {
    const endpoint = isTestnet
      ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
      : 'https://toncenter.com/api/v2/jsonRPC'

    const client = new TonClient({
      endpoint,
      apiKey: TONCENTER_API_KEY
    })

    const address = Address.parse(walletAddress)
    const balance = await client.getBalance(address)

    return parseFloat(fromNano(balance))
  } catch (error) {
    console.error('Error fetching TON balance:', error)
    return 0
  }
}

// Функция для получения цены TON через наш API
async function fetchTonPrice(): Promise<number> {
  try {
    const response = await fetch('/api/ton-prices?currencies=usd')
    const data = await response.json()
    return data.prices?.usd || 0
  } catch (error) {
    console.error('Error fetching TON price from API:', error)
    return 2.5 // fallback значение
  }
}

// Функция для получения цены UzsCoin
async function fetchUzsPrice(): Promise<number> {
  try {
    // Получаем курс USD/UZS через наш API
    const response = await fetch('/api/usd-to-uzs')
    const data = await response.json()
    const usdToUzs = data.rate || 12500
    
    // Для UzsCoin предполагаем стабильную цену 1 UZS = 1/usdToUzs USD
    // Это примерная логика - замените на реальную цену токена если доступна
    return 1 / usdToUzs
  } catch (error) {
    console.error('Error fetching UZS price:', error)
    return 0.00008 // fallback значение (~1/12500)
  }
}

export default function UzsTonBalances() {
  const wallet = useTonWallet()
  const address = useTonAddress()
  const [uzsBal, setUzsBal] = useState<number | null>(null)
  const [tonBal, setTonBal] = useState<number | null>(null)
  const [tonPrice, setTonPrice] = useState<number | null>(null)
  const [uzsPrice, setUzsPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const connected = !!wallet && !!address

  // Форматирование чисел
  const formatBalance = (balance: number | null, decimals: number = 2): string => {
    if (balance === null) return '—'
    if (balance === 0) return '0.00'

    if (balance < 0.001) return balance.toFixed(9)
    if (balance < 1) return balance.toFixed(4)

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(balance)
  }

  useEffect(() => {
    let mounted = true
    let timer: NodeJS.Timeout

    const loadBalances = async () => {
      if (!mounted || !connected) return

      setLoading(true)

      try {
        const [price, uzsPrice, jettonBalance, tonBalance] = await Promise.all([
          fetchTonPrice(),
          fetchUzsPrice(),
          fetchJettonBalance(address, UZS_MASTER, true),
          fetchTonBalance(address, true)
        ])

        if (!mounted) return

        setTonPrice(price)
        setUzsPrice(uzsPrice)
        setUzsBal(jettonBalance)
        setTonBal(tonBalance)
      } catch (error) {
        console.error('Failed to load balances:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadBalances()

    // Обновляем каждые 60 секунд (увеличено с 30 для уменьшения нагрузки)
    timer = setInterval(loadBalances, 60000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [connected, address])

  const displayUzsBalance = useMemo(() =>
    formatBalance(uzsBal), [uzsBal]
  )

  const displayTonBalance = useMemo(() =>
    formatBalance(tonBal), [tonBal]
  )

  const displayUzsPrice = useMemo(() =>
    uzsPrice !== null ? `${formatBalance(uzsPrice, 2)}` : '—',
    [uzsPrice]
  )

  const displayTonPrice = useMemo(() =>
    tonPrice !== null ? `${formatBalance(tonPrice, 2)}` : '—',
    [tonPrice]
  )

  return (
    <div className="rounded-3xl p-4 border border-white/10 bg-gradient-to-r from-[#0f1115] to-[#1a1d22]">
      {/* UzsCoin block */}


      {/* Toncoin block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 rounded-full bg-white/10 grid place-items-center overflow-hidden">
            <Image
              src="/ton_symbol.svg"
              alt="Toncoin"
              width={28}
              height={28}
              className="object-contain w-full"
            />
          </div>
          <div className='flex flex-col items-start'>
            <div className="text-sm text-white/70">Toncoin</div>
            <div className="text-xs font-semibold tabular-nums">
              {displayTonPrice}
            </div>
          </div>
        </div>
        <div className="text-sm font-semibold tabular-nums">
          {connected ? `${displayTonBalance}` : 'Connect wallet'}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-white/10" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 rounded-full bg-white/10 grid place-items-center overflow-hidden">
            <Image
              src="/uzscoin.png"
              alt="UzsCoin"
              width={28}
              height={28}
              className="object-contain w-full"
            />
          </div>
          <div className='flex flex-col items-start'>
            <div className="text-sm text-white/70">UzsCoin</div>
            <div className="text-xs font-semibold tabular-nums">
              {displayUzsPrice}
            </div>
            {loading && (
              <div className="text-xs text-yellow-400">Updating...</div>
            )}
          </div>
        </div>
        <div className="text-lg font-semibold tabular-nums">
          {connected ? displayUzsBalance : 'Connect wallet'}
        </div>
      </div>

    </div>
  )
}