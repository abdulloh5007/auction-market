import { NextRequest, NextResponse } from 'next/server'

export type Fiat = 'usd' | 'eur' | 'rub' | 'uzs'
export type TonPrices = Partial<Record<Fiat, number>>

// Кэш для хранения цен по валютам
const pricesCache = new Map<string, {
  prices: TonPrices
  timestamp: number
}>()

const CACHE_DURATION = 30 * 1000 // 30 секунд в миллисекундах

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const currencies = searchParams.get('currencies') || 'usd'
  const currencyArray = currencies.split(',').filter(c => ['usd', 'eur', 'rub', 'uzs'].includes(c)) as Fiat[]
  
  const cacheKey = currencyArray.sort().join(',')
  
  try {
    // Проверяем кэш
    const cached = pricesCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        prices: cached.prices,
        cached: true,
        timestamp: cached.timestamp
      })
    }

    // Делаем запрос к CoinGecko API
    const vs = currencyArray.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=${vs}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TON-NextJS-App/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 секунд
      }
    )

    if (!response.ok) {
      // Если сервис недоступен, возвращаем кэшированное значение если есть
      if (cached) {
        return NextResponse.json({
          prices: cached.prices,
          cached: true,
          stale: true,
          timestamp: cached.timestamp
        })
      }
      
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const tonData = data['the-open-network'] || {}
    
    const prices: TonPrices = {}
    for (const currency of currencyArray) {
      const price = tonData[currency]
      if (typeof price === 'number') {
        prices[currency] = price
      }
    }

    // Обновляем кэш
    pricesCache.set(cacheKey, {
      prices,
      timestamp: Date.now()
    })

    return NextResponse.json({
      prices,
      cached: false,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching TON prices:', error)
    
    // Если есть кэшированное значение, возвращаем его
    const cached = pricesCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        prices: cached.prices,
        cached: true,
        stale: true,
        timestamp: cached.timestamp
      })
    }

    // Возвращаем fallback значения
    const fallbackPrices: TonPrices = {}
    for (const currency of currencyArray) {
      switch (currency) {
        case 'usd':
          fallbackPrices.usd = 2.5
          break
        case 'eur':
          fallbackPrices.eur = 2.3
          break
        case 'rub':
          fallbackPrices.rub = 250
          break
        case 'uzs':
          fallbackPrices.uzs = 32000
          break
      }
    }

    return NextResponse.json({
      prices: fallbackPrices,
      cached: false,
      fallback: true,
      timestamp: Date.now(),
      error: 'Unable to fetch current prices'
    }, { status: 200 })
  }
}
