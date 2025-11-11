import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address') || ''
  const chain = (searchParams.get('chain') as 'mainnet' | 'testnet') || 'mainnet'

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  try {
    const tonapiKey = process.env.TONAPI_KEY
    const toncenterKey = process.env.TONCENTER_API_KEY

    if (chain === 'testnet') {
      // Prefer toncenter testnet (public)
      try {
        const url = `https://testnet.toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(address)}${
          toncenterKey ? `&api_key=${toncenterKey}` : ''
        }`
        const r = await fetch(url, { next: { revalidate: 15 } })
        const j = await r.json()
        const nanotons = j?.result?.balance
        if (typeof nanotons === 'string') {
          return NextResponse.json({ balance: parseInt(nanotons, 10) / 1e9 })
        }
      } catch {}
      // Fallback: testnet tonapi
      try {
        const url = `https://testnet.tonapi.io/v2/accounts/${encodeURIComponent(address)}`
        const r = await fetch(url, {
          headers: tonapiKey ? { Authorization: `Bearer ${tonapiKey}` } : undefined,
          next: { revalidate: 15 },
        })
        const j = await r.json()
        if (typeof j?.balance === 'number') {
          return NextResponse.json({ balance: j.balance / 1e9 })
        }
      } catch {}
    } else {
      // MAINNET
      if (tonapiKey) {
        try {
          const url = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}`
          const r = await fetch(url, {
            headers: { Authorization: `Bearer ${tonapiKey}` },
            next: { revalidate: 15 },
          })
          const j = await r.json()
          if (typeof j?.balance === 'number') {
            return NextResponse.json({ balance: j.balance / 1e9 })
          }
        } catch {}
      }
      if (toncenterKey) {
        try {
          const url = `https://toncenter.com/api/v2/getAddressInformation?address=${encodeURIComponent(
            address
          )}&api_key=${toncenterKey}`
          const r = await fetch(url, { next: { revalidate: 15 } })
          const j = await r.json()
          const nanotons = j?.result?.balance
          if (typeof nanotons === 'string') {
            return NextResponse.json({ balance: parseInt(nanotons, 10) / 1e9 })
          }
        } catch {}
      }
      // Public fallback (may rate-limit)
      try {
        const url = `https://tonapi.io/v2/accounts/${encodeURIComponent(address)}`
        const r = await fetch(url, { next: { revalidate: 15 } })
        const j = await r.json()
        if (typeof j?.balance === 'number') {
          return NextResponse.json({ balance: j.balance / 1e9 })
        }
      } catch {}
    }

    return NextResponse.json({ error: 'Unable to fetch balance' }, { status: 502 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
