"use client"

export default function NFTHistory({ events = [] as any[] }) {
  if (!events?.length) {
    return <div className="text-white/60 text-sm">No history yet</div>
  }
  return (
    <div className="space-y-2">
      {events.map((e, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium capitalize">{e.event}</div>
            <div className="text-xs text-white/60">{new Date(e.timestamp).toLocaleString()}</div>
          </div>
          <div className="text-sm text-white/70">
            {e.from && <span>From: <span className="font-mono">{e.from}</span> </span>}
            {e.to && <span>To: <span className="font-mono">{e.to}</span> </span>}
            {e.price_ton && <span>• Price: {e.price_ton} TON</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
