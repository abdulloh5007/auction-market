// Используем серверный API route вместо прямых запросов к внешним API
export async function fetchTonPrice(): Promise<number> {
  try {
    const response = await fetch('/api/ton-price', {
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
    return data.price
  } catch (error) {
    console.error('Error fetching TON price from API:', error)
    // Возвращаем fallback значение при ошибке
    return 2.5
  }
}
