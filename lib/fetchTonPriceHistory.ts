import axios from 'axios'

export async function fetchTonPriceHistory(days = 1): Promise<Array<{ t: number; p: number }>> {
  // CoinGecko market chart for last N days
  const url = `https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=usd&days=${days}&interval=hourly`
  const res = await axios.get(url)
  const arr: [number, number][] = res.data?.prices
  if (!Array.isArray(arr)) throw new Error('History unavailable')
  return arr.map(([t, p]) => ({ t, p }))
}
