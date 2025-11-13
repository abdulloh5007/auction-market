"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { collections } from '@/data/collections'
import { ShieldCheck, Share2, Heart, MoreHorizontal, RefreshCw, Flag, PlusCircle, Tag } from 'lucide-react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { prepareTestnetTransfer } from '@/lib/tonTransfer'
import { useToast } from '@/components/ui/ToastProvider'
import Modal from '@/components/ui/Modal'

export default function NFTPage() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const router = useRouter()
  const toast = useToast()

  const [buyOpen, setBuyOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const userFriendlyAddress = useTonAddress()
  const [liked, setLiked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [refreshTs, setRefreshTs] = useState<number | null>(null)

  const item = useMemo(() => {
    const all = collections.flatMap((c) => c.nfts.map((n) => ({
      id: `${c.collection.id}-${n.token_id}`,
      nft: n,
      collection: c.collection,
      stats: c.stats,
    })))
    return all.find((x) => x.id === tokenId) || null
  }, [tokenId])

  const priceTon = item?.stats?.average_sale_price_ton || item?.stats?.floor_price_ton || 0

  const onBuy = useCallback(async () => {
    try {
      setBusy(true)
      setStatus(null)
      if (!wallet) {
        setStatus('Please connect your wallet first.')
        return
      }
      const envTo = process.env.NEXT_PUBLIC_TON_TESTNET_RECIPIENT
      const to = (envTo && envTo.trim()) || userFriendlyAddress
      if (!to || !/^[-_A-Za-z0-9]{48,66}$/.test(to)) {
        throw new Error('Wrong recipient address format. Set NEXT_PUBLIC_TON_TESTNET_RECIPIENT to a valid testnet address.')
      }
      const tx = prepareTestnetTransfer({ to, amountTon: priceTon })
      await tonConnectUI.sendTransaction(tx)
      setStatus('Transaction submitted')
      setBuyOpen(false)
    } catch (e: any) {
      if (e?.code === 'USER_REJECTS_ERROR') {
        setStatus('Transaction rejected by user')
      } else {
        setStatus('Error: ' + (e?.message || 'unknown'))
      }
    } finally {
      setBusy(false)
    }
  }, [wallet, userFriendlyAddress, tonConnectUI, priceTon])

  // Initialize liked state from localStorage after hydration
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('liked_nfts') : null
      const map = raw ? JSON.parse(raw) : {}
      if (item?.id) setLiked(!!map[item.id])
    } catch { }
  }, [item?.id])

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('liked_nfts') : null
        const map = raw ? JSON.parse(raw) : {}
        if (item?.id) {
          map[item.id] = next
          localStorage.setItem('liked_nfts', JSON.stringify(map))
        }
      } catch { }
      return next
    })
  }, [item?.id])

  const doShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if ((navigator as any)?.share) {
        await (navigator as any).share({ title: item?.nft?.name || 'NFT', url })
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success('Ссылка скопирована')
      }
      setMenuOpen(false)
    } catch { }
  }, [item?.nft?.name, toast])

  // Close 3-dots menu on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuOpen) return
      const el = menuRef.current
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const doRefresh = useCallback(async () => {
    setRefreshTs(Date.now())
    setMenuOpen(false)
    toast.success('Метаданные обновлены')
  }, [toast])



  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">NFT not found</h1>
          <p className="text-white/60 mb-4">The NFT you are looking for does not exist.</p>
          <Link href="/" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Go Home</Link>
        </div>
      </div>
    )
  }

  const { nft, collection } = item
  const tabs = ['Details','Offers','Stats','History','Comments'] as const
  const [activeTab, setActiveTab] = useState(0)
  const [tabFadeKey, setTabFadeKey] = useState(0)
  const onTab = (i: number) => { setActiveTab(i); setTabFadeKey((k) => k + 1) }
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [underline, setUnderline] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current[activeTab]
    if (!el) return
    const parent = el.parentElement?.parentElement // wrapper of all buttons
    const parentRect = parent?.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const left = parentRect ? rect.left - parentRect.left : el.offsetLeft
    setUnderline({ left, width: rect.width })
  }, [activeTab, tabs.length])

  useEffect(() => {
    const onResize = () => {
      const el = tabRefs.current[activeTab]
      if (!el) return
      const parent = el.parentElement?.parentElement
      const parentRect = parent?.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      const left = parentRect ? rect.left - parentRect.left : el.offsetLeft
      setUnderline({ left, width: rect.width })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeTab])



  return (
    <>
      <div className="px-4 py-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[440px_520px] gap-8">
          {/* Left: Sticky Image Card */}
          <div className="lg:sticky sticky-offset lg:self-start">
            <div className="surface rounded-2xl overflow-hidden border border-dark mx-auto w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-none">
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-white/5 to-transparent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={refreshTs ? `${nft.image_url}${nft.image_url.includes('?') ? '&' : '?'}t=${refreshTs}` : nft.image_url}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay Controls */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute top-3 left-3 pointer-events-auto">
                    <button
                      className="rounded-xl bg-black/40 backdrop-blur-md p-2 transition text-white/90 hover:bg-black/50"
                      onClick={toggleLike}
                      aria-label="Like"
                    >
                      <Heart className={`h-5 w-5 transition ${liked ? 'text-rose-300 fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 pointer-events-auto">
                    <div className="relative">
                      <button
                        className="rounded-xl bg-black/40 backdrop-blur-md p-2 text-white/90 hover:bg-black/50"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="More"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      <div
                        ref={menuRef}
                        className={`absolute right-0 mt-2 w-52 z-50 surface border border-dark rounded-xl shadow-glass overflow-hidden origin-top-right transition-all duration-300 ease-out transform ${menuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
                      >
                        <button onClick={doShare} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/10">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                        <button onClick={doRefresh} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/10">
                          <RefreshCw className="h-4 w-4" />
                          <span>Refresh Metadata</span>
                        </button>
                        <button disabled className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/40 cursor-not-allowed">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Simplified Content */}
          <div className="space-y-6">
            {/* Title + status */}
            <div>
              <div className="flex flex-wrap items-start gap-1">
                <h1 className="text-base sm:text-lg md:text-xl font-bold">{nft.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 mt-1 ${priceTon ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'bg-white/10 text-white/70 border border-white/15'}`}>
                  {priceTon ? 'For Sale' : 'Not Listed'}
                </span>
              </div>
              {/* Collection row */}
              <button onClick={() => router.push(`/collections/${collection.slug}` as any)} className="mt-3 flex items-center gap-3 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={collection.image_url} alt={collection.name} className="h-10 w-10 rounded-lg object-cover border border-dark" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-white/90 group-hover:text-accent-300 transition-colors font-medium truncate max-w-[200px] sm:max-w-[240px] md:max-w-[280px]">{collection.name}</span>
                  {collection.verified && <ShieldCheck className="h-4 w-4 text-accent-400" />}
                </div>
              </button>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white/60 tracking-wider">PRICE</div>
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ton_symbol.svg" alt="TON" className="h-6 w-6" />
                  <div className="text-2xl sm:text-3xl font-bold">{priceTon || 0} TON</div>
                </div>
                {priceTon ? (
                  <div className="text-sm text-muted">≈ ${(priceTon * 2.5).toFixed(2)}</div>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setBuyOpen(true)} className="rounded-lg btn-primary font-semibold text-sm inline-flex flex-col items-center gap-2">
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span className="truncate min-w-0">Buy Now</span>
              </button>
              <button onClick={() => setOfferOpen(true)} className="rounded-lg btn-ghost font-semibold text-sm inline-flex flex-col items-center gap-2">
                <Tag className="h-4 w-4 shrink-0" />
                <span className="truncate">Make Offer</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className="relative">
                <div className="flex items-center gap-6 text-sm text-white/70 relative">
                  {tabs.map((t, i) => (
                    <button
                      key={t}
                      ref={(el) => { tabRefs.current[i] = el }}
                      onClick={() => onTab(i)}
                      className={`py-2 font-semibold transition-colors ${activeTab===i?'text-white':'hover:text-white/90'}`}
                    >
                      {t}
                    </button>
                  ))}
                  {/* Moving underline */}
                  <span
                    className="pointer-events-none absolute bottom-0 h-[2px] bg-white transition-all duration-300"
                    style={{ left: `${underline.left}px`, width: `${underline.width}px` }}
                  />
                </div>
                {/* Track line */}
                <div className="mt-1 h-px bg-white/10" />
              </div>

              <div key={tabFadeKey} className="mt-4 transition-opacity duration-300 opacity-100">
                {activeTab===0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/80">{nft.metadata.description}</div>
                    {Array.isArray(nft.metadata.attributes) && nft.metadata.attributes.length>0 && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {nft.metadata.attributes.map((a, idx) => (
                          <div key={idx} className="rounded-lg bg-white/5 border border-dark p-2">
                            <div className="text-white/50 text-xs">{a.trait_type}</div>
                            <div className="font-medium">{String(a.value)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab===1 && (
                  <div className="text-sm text-white/70">No offers yet.</div>
                )}
                {activeTab===2 && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-white/50">Floor</div><div className="font-semibold">{item.stats.floor_price_ton} TON</div></div>
                    <div><div className="text-white/50">Avg Sale</div><div className="font-semibold">{item.stats.average_sale_price_ton} TON</div></div>
                    <div><div className="text-white/50">Owners</div><div className="font-semibold">{item.stats.num_owners}</div></div>
                    <div><div className="text-white/50">24h Volume</div><div className="font-semibold">{item.stats.volume_24h_ton} TON</div></div>
                  </div>
                )}
                {activeTab===3 && (
                  <div className="text-sm text-white/70">No history.</div>
                )}
                {activeTab===4 && (
                  <div className="text-sm text-white/70">No comments.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Buy Modal */}
      <Modal open={buyOpen} onClose={() => setBuyOpen(false)} title="Buy NFT" drawerOnMobile>
        <div className="space-y-4">
          <div className="flex items-center gap-3 surface border border-dark p-3 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={nft.image_url} alt={nft.name} className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <div className="font-semibold">{nft.name}</div>
              <div className="text-sm text-muted">{collection.name}</div>
            </div>
          </div>
          <div className="surface border border-dark rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted">NFT Price</div>
                <div className="text-xs text-muted">Includes service fee and creator royalties</div>
              </div>
              <div className="text-lg font-semibold">{priceTon} TON</div>
            </div>
          </div>
          {status && <div className="text-sm text-muted">{status}</div>}
          <button disabled={busy || !wallet} onClick={onBuy} className="w-full h-11 rounded-xl btn-primary font-semibold">
            {busy ? 'Processing...' : `Buy for ${priceTon} TON`}
          </button>
          {!wallet && <div className="text-xs text-muted text-center">Please connect your wallet to proceed</div>}
        </div>
      </Modal>

      {/* Offer Modal (placeholder UI) */}
      <Modal open={offerOpen} onClose={() => setOfferOpen(false)} title="Make Offer" drawerOnMobile>
        <div className="space-y-4">
          <div className="flex items-center gap-3 surface border border-dark p-3 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={nft.image_url} alt={nft.name} className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <div className="font-semibold">{nft.name}</div>
              <div className="text-sm text-muted">{collection.name}</div>
            </div>
          </div>
          <div className="surface border border-dark rounded-xl p-4">
            <div className="text-sm text-muted mb-2">Your Offer (TON)</div>
            <input type="number" step="0.01" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-dark focus:outline-none focus:border-accent-400" placeholder="Enter amount" />
          </div>
          <button onClick={() => setOfferOpen(false)} className="w-full h-11 rounded-xl btn-primary font-semibold">Submit offer</button>
        </div>
      </Modal>
    </>
  )
}