import axios from 'axios'

export type Fiat = 'usd' | 'eur' | 'rub' | 'uzs'
export type TonPrices = Partial<Record<Fiat, number>>

const ONE_MIN = 60_000

function keyFor(curs: Fiat[]) {
  const vs = [...new Set(curs)].sort().join(',')
  return `ton_prices_cache_${vs}`
}

type CacheEntry = { t: number; v: TonPrices }

function readCache(key: string): CacheEntry | null {
  if (typeof window === 'undefined') return null
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null }
}
function writeCache(key: string, v: TonPrices) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })) } catch {}
}

export async function fetchTonPrices(currencies: Fiat[] = ['usd']): Promise<TonPrices> {
  const key = keyFor(currencies)
  const cached = readCache(key)
  const now = Date.now()
  if (cached && now - cached.t < ONE_MIN) {
    return cached.v
  }
  const vs = Array.from(new Set(currencies)).join(',')
  try {
    const cg = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=${vs}`
    )
    const obj = cg.data?.['the-open-network'] || {}
    const out: TonPrices = {}
    for (const c of currencies) {
      const v = obj[c]
      if (typeof v === 'number') out[c] = v
    }
    writeCache(key, out)
    return out
  } catch {}
  if (cached) return cached.v
  return {}
}
