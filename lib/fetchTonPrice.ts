import axios from 'axios'

const ONE_MIN = 60_000
const KEY = 'ton_price_cache_usd'

type CacheEntry = { t: number; v: number }

function readCache(): CacheEntry | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function writeCache(v: number) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v })) } catch {}
}

// Free source: CoinGecko Simple Price API (no key required)
export async function fetchTonPrice(): Promise<number> {
  const cached = readCache()
  const now = Date.now()
  if (cached && now - cached.t < ONE_MIN) {
    return cached.v
  }
  try {
    const cg = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd'
    )
    const price = cg.data?.['the-open-network']?.usd
    if (typeof price === 'number') { writeCache(price); return price }
  } catch {}
  // Fallback to TonAPI public (may be rate-limited)
  try {
    const res = await axios.get('https://tonapi.io/v2/rates?tokens=ton&currencies=usd')
    const price = res.data?.rates?.ton?.prices?.USD
    if (typeof price === 'number') { writeCache(price); return price }
  } catch {}
  if (cached) return cached.v
  throw new Error('Price unavailable')
}
