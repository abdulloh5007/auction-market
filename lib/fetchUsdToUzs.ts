// Используем серверный API route вместо прямых запросов к внешним API
// Returns how many UZS in 1 USD, cached on server side
export async function fetchUsdToUzs(): Promise<number> {
  try {
    const response = await fetch('/api/usd-to-uzs', {
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
    return data.rate
  } catch (error) {
    console.error('Error fetching USD to UZS rate from API:', error)
    // Возвращаем fallback значение при ошибке
    return 12500 // примерный курс USD/UZS
  }
}
