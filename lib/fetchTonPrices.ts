export type Fiat = 'usd' | 'eur' | 'rub' | 'uzs'
export type TonPrices = Partial<Record<Fiat, number>>

// Используем серверный API route вместо прямых запросов к внешним API
export async function fetchTonPrices(currencies: Fiat[] = ['usd']): Promise<TonPrices> {
  try {
    const currenciesParam = Array.from(new Set(currencies)).join(',')
    const response = await fetch(`/api/ton-prices?currencies=${currenciesParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // API route уже обрабатывает кэширование на сервере
    return data.prices || {}
  } catch (error) {
    console.error('Error fetching TON prices from API:', error)
    
    // Возвращаем fallback значения при ошибке
    const fallbackPrices: TonPrices = {}
    for (const currency of currencies) {
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
    return fallbackPrices
  }
}
