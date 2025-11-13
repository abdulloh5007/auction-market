"use client"

import { collections } from '@/data/collections'
import type { Route } from 'next'
import { prepareTestnetTransfer } from '@/lib/tonTransfer'
import { useToast } from '@/components/ui/ToastProvider'
import Image from 'next/image'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { Heart, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Modal from '../ui/Modal'

export default function NFTGrid() {
  const toast = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const userFriendlyAddress = useTonAddress()
  const [modalOpen, setModalOpen] = useState(false)
  const [txDetails, setTxDetails] = useState<{ from?: string; to?: string; amount?: number; nftId?: string } | null>(null)
  const router = useRouter()
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  // Defer reading localStorage to after hydration to avoid SSR/CSR mismatch
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('liked_nfts') : null
      setLikedMap(raw ? JSON.parse(raw) : {})
    } catch {}
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const [erroredMap, setErroredMap] = useState<Record<string, boolean>>({})

  const toggleLike = useCallback((id: string) => {
    setLikedMap(prev => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem('liked_nfts', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const onBuy = useCallback(async (id: string, valueTon: number) => {
    try {
      setBusyId(id)
      setStatus(null)
      if (!wallet) {
        setStatus('Please connect your wallet first.')
        setBusyId(null)
        return
      }
      // Prefer explicit testnet recipient from env, else fallback to own address.
      const envTo = process.env.NEXT_PUBLIC_TON_TESTNET_RECIPIENT
      const to = (envTo && envTo.trim()) || userFriendlyAddress
      if (!to || !/^[-_A-Za-z0-9]{48,66}$/.test(to)) {
        throw new Error('Wrong recipient address format. Set NEXT_PUBLIC_TON_TESTNET_RECIPIENT to a valid testnet address.')
      }
      const tx = prepareTestnetTransfer({
        to,
        amountTon: valueTon,
      })
      const result = await tonConnectUI.sendTransaction(tx)
      // transaction submitted; rely on modal below for UX

      setTxDetails({ from: userFriendlyAddress, to, amount: valueTon, nftId: id })

      // Show toast bottom-left with success styling; clicking opens modal
      toast.success('Транзакция успешно отправлена', { onClick: () => setModalOpen(true) })
    } catch (e: any) {
      if (e?.code === 'USER_REJECTS_ERROR') {
        setStatus('⚠️ Transaction rejected by user')
      } else {
        setStatus('❌ Error: ' + (e?.message || 'unknown'))
      }
    } finally {
      setBusyId(null)
    }
  }, [tonConnectUI, wallet])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {collections.flatMap(c => c.nfts.map(n => ({
          id: `${c.collection.id}-${n.token_id}`,
          src: n.image_url,
          title: n.name,
          description: n.metadata.description,
          value: (c.stats.average_sale_price_ton || c.stats.floor_price_ton)
        }))).map((n) => (
          <div
            key={n.id}
            className="group relative overflow-hidden rounded-2xl card-glass transition-all duration-300 hover:shadow-glass"
          >
            {/* Image area */}
            <div className="relative w-full h-56 overflow-hidden cursor-pointer" onClick={() => router.push((`/nft/${n.id}` as Route))}>
              <Image
                src={erroredMap[n.id] ? `https://placehold.co/1200x800/png?text=${encodeURIComponent(n.title)}` : n.src}
                alt={n.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                onError={() => setErroredMap(prev => ({ ...prev, [n.id]: true }))}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-80" />

              {/* Top-right action buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button
                  type="button"
                  aria-label="Like"
                  className={`rounded-full backdrop-blur-md p-2 active:scale-95 transition-all duration-200 bg-black/40 hover:bg-black/50 ${likedMap[n.id] ? 'text-rose-400' : 'text-white/80 hover:text-white'}`}
                  onClick={(e) => { e.stopPropagation(); toggleLike(n.id) }}
                >
                  <Heart className={`h-5 w-5 ${likedMap[n.id] ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  aria-label="Share"
                  className="rounded-full bg-black/40 backdrop-blur-md p-2 text-white/80 hover:text-white hover:bg-black/50 active:scale-95 transition"
                 onClick={async (e) => {
                   e.stopPropagation();
                   const origin = typeof window !== 'undefined' ? window.location.origin : ''
                   const url = `${origin}/nft/${n.id}`
                   if (navigator?.share) {
                     try { await navigator.share({ title: n.title, url }) } catch {}
                   } else if (navigator?.clipboard?.writeText) {
                     try { await navigator.clipboard.writeText(url); toast.success('Ссылка скопирована') } catch {}
                   }
                 }}
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Slide-up buy bar */}
              <div className="absolute inset-x-3 bottom-3 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  className="w-full rounded-xl bg-accent-500 text-white font-medium py-2.5 shadow-accent hover:bg-accent-400 active:scale-[0.98] transition-colors duration-200 disabled:opacity-60"
                  disabled={busyId === n.id || !(mounted && !!wallet)}
                  onClick={(e) => { e.stopPropagation(); onBuy(n.id, n.value) }}
                >
                  {busyId === n.id ? 'Processing...' : (mounted && !!wallet) ? 'Купить NFT' : 'Подключите кошелек'}
                </button>
              </div>
            </div>

            {/* Meta area */}
            <div className="p-4 cursor-pointer" onClick={() => router.push((`/nft/${n.id}` as Route))}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-left">
                  <div className="font-semibold tracking-tight">{n.title}</div>
                  <div className="text-sm text-white/60 line-clamp-2">{n.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-accent-300 font-bold">{n.value} TON</div>
                  <div className="text-xs text-white/50">~ ${Math.round(n.value * 2.5)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Успешная транзакция">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Покупка NFT прошла успешно</span>
          </div>
          {txDetails && (
            <div className="text-sm text-white/80 space-y-1">
              {txDetails.nftId && (
                <div>
                  <span className="text-white/60">NFT:</span> {txDetails.nftId}
                </div>
              )}
              {txDetails.from && (
                <div className="break-all">
                  <span className="text-white/60">От:</span> {txDetails.from}
                </div>
              )}
              {txDetails.to && (
                <div className="break-all">
                  <span className="text-white/60">Кому:</span> {txDetails.to}
                </div>
              )}
              {txDetails.amount !== undefined && (
                <div>
                  <span className="text-white/60">Сумма:</span> {txDetails.amount} TON
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
