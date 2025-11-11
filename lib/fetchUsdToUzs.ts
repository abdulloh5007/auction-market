import axios from 'axios'

const ONE_MIN = 60_000
const KEY = 'usd_to_uzs_cache'

type CacheEntry = { t: number; v: number }

function readCache(): CacheEntry | null {
  if (typeof window === 'undefined') return null
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
function writeCache(v: number) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v })) } catch {}
}

// Returns how many UZS in 1 USD, cached for 1 minute in localStorage
export async function fetchUsdToUzs(): Promise<number> {
  const cached = readCache()
  const now = Date.now()
  if (cached && now - cached.t < ONE_MIN) return cached.v
  try {
    const res = await axios.get('https://open.er-api.com/v6/latest/USD')
    const rate = res.data?.rates?.UZS
    if (typeof rate === 'number') { writeCache(rate); return rate }
  } catch {}
  try {
    const alt = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=UZS').then(r=>r.json())
    const rate = alt?.rates?.UZS
    if (typeof rate === 'number') { writeCache(rate); return rate }
  } catch {}
  if (cached) return cached.v
  throw new Error('Unable to fetch USD→UZS rate')
}
