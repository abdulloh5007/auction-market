import { NextResponse } from 'next/server'

// Кэш для хранения курса USD/UZS
let exchangeRateCache: {
  rate: number
  timestamp: number
} | null = null

const CACHE_DURATION = 60 * 1000 // 1 минута в миллисекундах

export async function GET() {
  try {
    // Проверяем кэш
    if (exchangeRateCache && Date.now() - exchangeRateCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        rate: exchangeRateCache.rate,
        cached: true,
        timestamp: exchangeRateCache.timestamp
      })
    }

    // Пробуем первый источник - open.er-api.com
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TON-NextJS-App/1.0'
        },
        signal: AbortSignal.timeout(8000) // 8 секунд
      })

      if (response.ok) {
        const data = await response.json()
        const rate = data?.rates?.UZS
        
        if (typeof rate === 'number') {
          // Обновляем кэш
          exchangeRateCache = {
            rate,
            timestamp: Date.now()
          }

          return NextResponse.json({
            rate,
            cached: false,
            timestamp: exchangeRateCache.timestamp,
            source: 'er-api'
          })
        }
      }
    } catch (error) {
      console.log('First exchange rate API failed, trying backup...')
    }

    // Пробуем второй источник - exchangerate.host
    try {
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=UZS', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TON-NextJS-App/1.0'
        },
        signal: AbortSignal.timeout(8000) // 8 секунд
      })

      if (response.ok) {
        const data = await response.json()
        const rate = data?.rates?.UZS
        
        if (typeof rate === 'number') {
          // Обновляем кэш
          exchangeRateCache = {
            rate,
            timestamp: Date.now()
          }

          return NextResponse.json({
            rate,
            cached: false,
            timestamp: exchangeRateCache.timestamp,
            source: 'exchangerate.host'
          })
        }
      }
    } catch (error) {
      console.log('Second exchange rate API also failed')
    }

    // Если все API недоступны, возвращаем кэшированное значение если есть
    if (exchangeRateCache) {
      return NextResponse.json({
        rate: exchangeRateCache.rate,
        cached: true,
        stale: true,
        timestamp: exchangeRateCache.timestamp
      })
    }

    throw new Error('All exchange rate APIs failed')

  } catch (error) {
    console.error('Error fetching USD to UZS rate:', error)
    
    // Если есть кэшированное значение, возвращаем его
    if (exchangeRateCache) {
      return NextResponse.json({
        rate: exchangeRateCache.rate,
        cached: true,
        stale: true,
        timestamp: exchangeRateCache.timestamp
      })
    }

    // Возвращаем fallback значение (примерный курс UZS)
    return NextResponse.json({
      rate: 12500, // fallback курс USD/UZS
      cached: false,
      fallback: true,
      timestamp: Date.now(),
      error: 'Unable to fetch current exchange rate'
    }, { status: 200 })
  }
}