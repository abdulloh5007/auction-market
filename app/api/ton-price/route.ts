import { NextResponse } from 'next/server'

// Кэш для хранения цены и времени последнего запроса
let priceCache: {
  price: number
  timestamp: number
} | null = null

const CACHE_DURATION = 30 * 1000 // 30 секунд в миллисекундах

export async function GET() {
  try {
    // Проверяем кэш
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        timestamp: priceCache.timestamp
      })
    }

    // Делаем запрос к CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TON-NextJS-App/1.0'
        },
        // Добавляем таймаут
        signal: AbortSignal.timeout(10000) // 10 секунд
      }
    )

    if (!response.ok) {
      // Если сервис недоступен, возвращаем кэшированное значение если есть
      if (priceCache) {
        return NextResponse.json({
          price: priceCache.price,
          cached: true,
          stale: true,
          timestamp: priceCache.timestamp
        })
      }
      
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const price = data['the-open-network']?.usd

    if (typeof price !== 'number') {
      throw new Error('Invalid price data received from CoinGecko')
    }

    // Обновляем кэш
    priceCache = {
      price,
      timestamp: Date.now()
    }

    return NextResponse.json({
      price,
      cached: false,
      timestamp: priceCache.timestamp
    })

  } catch (error) {
    console.error('Error fetching TON price:', error)
    
    // Если есть кэшированное значение, возвращаем его
    if (priceCache) {
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        stale: true,
        timestamp: priceCache.timestamp
      })
    }

    // Возвращаем fallback значение
    return NextResponse.json({
      price: 2.5, // fallback цена TON
      cached: false,
      fallback: true,
      timestamp: Date.now(),
      error: 'Unable to fetch current price'
    }, { status: 200 }) // Возвращаем 200 чтобы фронтенд мог работать
  }
}