import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner = searchParams.get('owner')
  const master = searchParams.get('master')
  const chain = (searchParams.get('chain') as 'mainnet' | 'testnet') || 'testnet'

  if (!owner || !master) {
    return NextResponse.json({ error: 'Missing owner or master' }, { status: 400 })
  }

  try {
    const base = chain === 'testnet' ? 'https://testnet.tonapi.io' : 'https://tonapi.io'
    const url = `${base}/v2/accounts/${encodeURIComponent(owner)}/jettons?limit=100`
    const r = await fetch(url, { next: { revalidate: 15 } })
    if (!r.ok) return NextResponse.json({ error: 'Failed to fetch jettons' }, { status: 502 })
    const data = await r.json()
    const items: any[] = data?.balances || data?.jettons || []
    const found = items.find((it: any) => {
      const addr = it?.jetton?.address || it?.jetton?.master || it?.address
      return typeof addr === 'string' && addr.replace(/[^A-Za-z0-9_\-]/g, '') === master.replace(/[^A-Za-z0-9_\-]/g, '')
    })
    if (!found) {
      return NextResponse.json({ balance: 0 })
    }
    const raw = Number(found?.balance ?? found?.quantity ?? 0)
    const decimals = Number(found?.jetton?.decimals ?? found?.metadata?.decimals ?? 9)
    const val = raw / Math.pow(10, isFinite(decimals) ? decimals : 9)
    return NextResponse.json({ balance: val })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
