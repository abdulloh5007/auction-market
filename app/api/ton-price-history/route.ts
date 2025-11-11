import { NextRequest, NextResponse } from 'next/server'

// Кэш для хранения истории цен
const historyCache = new Map<string, {
  history: Array<{ t: number; p: number }>
  timestamp: number
}>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 минут для истории цен

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = searchParams.get('days') || '1'
  const daysNum = Math.max(1, Math.min(365, parseInt(days, 10))) // Ограничиваем от 1 до 365 дней
  
  const cacheKey = `history_${daysNum}`
  
  try {
    // Проверяем кэш
    const cached = historyCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        history: cached.history,
        cached: true,
        timestamp: cached.timestamp
      })
    }

    // Делаем запрос к CoinGecko API
    const url = `https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=usd&days=${daysNum}&interval=hourly`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TON-NextJS-App/1.0'
      },
      signal: AbortSignal.timeout(15000) // 15 секунд для истории
    })

    if (!response.ok) {
      // Если сервис недоступен, возвращаем кэшированное значение если есть
      if (cached) {
        return NextResponse.json({
          history: cached.history,
          cached: true,
          stale: true,
          timestamp: cached.timestamp
        })
      }
      
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pricesArray: [number, number][] = data?.prices

    if (!Array.isArray(pricesArray)) {
      throw new Error('Invalid history data received from CoinGecko')
    }

    // Преобразуем в нужный формат
    const history = pricesArray.map(([t, p]) => ({ t, p }))

    // Обновляем кэш
    historyCache.set(cacheKey, {
      history,
      timestamp: Date.now()
    })

    return NextResponse.json({
      history,
      cached: false,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error fetching TON price history:', error)
    
    // Если есть кэшированное значение, возвращаем его
    const cached = historyCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        history: cached.history,
        cached: true,
        stale: true,
        timestamp: cached.timestamp
      })
    }

    // Возвращаем fallback данные - генерируем примерную историю
    const now = Date.now()
    const basePrice = 2.5
    const history = []
    
    for (let i = daysNum * 24; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000) // каждый час
      const variation = (Math.random() - 0.5) * 0.2 // ±10% вариация
      const price = basePrice * (1 + variation)
      history.push({ t: timestamp, p: price })
    }

    return NextResponse.json({
      history,
      cached: false,
      fallback: true,
      timestamp: now,
      error: 'Unable to fetch current price history'
    }, { status: 200 })
  }
}