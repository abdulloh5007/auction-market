"use client"

export default function NFTOffers({ bids = [] as any[] }) {
  if (!bids?.length) {
    return (
      <div className="text-white/60 text-sm">No offers yet</div>
    )
  }
  return (
    <div className="space-y-2">
      {bids.map((b, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-sm">
            <div className="text-white/80">{b.bidder}</div>
            <div className="text-white/50 text-xs">{new Date(b.timestamp).toLocaleString()}</div>
          </div>
          <div className="text-accent-300 font-semibold">{b.price_ton} TON</div>
        </div>
      ))}
    </div>
  )
}
