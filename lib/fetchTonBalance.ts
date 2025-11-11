// Fetch balance via server API to avoid CORS and keep keys secure
export async function fetchTonBalance(address: string, chain: 'mainnet' | 'testnet' = 'mainnet'): Promise<number> {
  const res = await fetch(`/api/balance?address=${encodeURIComponent(address)}&chain=${chain}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Unable to fetch balance')
  const data = await res.json()
  if (typeof data?.balance !== 'number') throw new Error('Unable to fetch balance')
  return data.balance
}
