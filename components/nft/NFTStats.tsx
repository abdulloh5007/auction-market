"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Users, Wallet } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function NFTStats({ stats }: { stats: any }) {
  const [history, setHistory] = useState<Array<{ t: number; p: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/ton-price-history?days=${days}`)
        const data = await res.json()
        if (!mounted) return
        setHistory(Array.isArray(data.history) ? data.history : [])
      } catch (e: any) {
        if (!mounted) return
        setError('Unable to load price history')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [days])

  const { minP, maxP, coords, change, chartData } = useMemo(() => {
    if (!history.length) return { minP: 0, maxP: 0, coords: [] as {x:number;y:number;p:number;t:number}[], change: 0, chartData: [] as Array<{ time: number; price: number }> }
    const values = history.map(h => h.p)
    const minP = Math.min(...values)
    const maxP = Math.max(...values)
    const change = history.length > 1 ? ((history[history.length - 1].p - history[0].p) / history[0].p) * 100 : 0
    
    const W = 600, H = 240, P = 20
    const n = history.length
    const xStep = (W - 2 * P) / Math.max(1, n - 1)
    const yScale = (val: number) => {
      if (maxP === minP) return H / 2
      return P + (H - 2 * P) * (1 - (val - minP) / (maxP - minP))
    }
    const pts = history.map((h, i) => ({ x: P + i * xStep, y: yScale(h.p), p: h.p, t: h.t }))

    const chartData = history.map(h => ({ time: h.t, price: h.p }))

    return { minP, maxP, coords: pts, change, chartData }
  }, [history])

  // Keep hover logic for header price display, but we'll use Recharts' Tooltip for chart hover
  const hover = (e: any) => {
    if (!svgRef.current || !coords.length) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    let nearest = 0
    let best = Infinity
    for (let i = 0; i < coords.length; i++) {
      const d = Math.abs(coords[i].x - x)
      if (d < best) { best = d; nearest = i }
    }
    setHoverIdx(nearest)
  }

  const isPositive = change >= 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Activity className="h-5 w-5" />}
          label="Floor Price"
          value={`${stats.floor_price_ton} TON`}
          subvalue="≈ $25.50"
          trend="+2.5%"
          positive
        />
        <StatCard 
          icon={<TrendingUp className="h-5 w-5" />}
          label="Average Sale"
          value={`${stats.average_sale_price_ton} TON`}
          subvalue="Last 7 days"
        />
        <StatCard 
          icon={<Wallet className="h-5 w-5" />}
          label="24h Volume"
          value={`${stats.volume_24h_ton} TON`}
          subvalue="≈ $12,345"
          trend="-1.2%"
        />
        <StatCard 
          icon={<Users className="h-5 w-5" />}
          label="Owners"
          value={stats.num_owners}
          subvalue={`${Math.floor(stats.num_owners / stats.total_supply * 100)}% unique`}
        />
      </div>

      {/* Trading Volume Stats */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1d29] overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Trading Volume
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-white/50 mb-2">24h Volume</div>
              <div className="text-2xl font-bold text-white mb-1">{stats.volume_24h_ton} TON</div>
              <div className="text-sm text-white/50">≈ $12,345</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-2">7d Volume</div>
              <div className="text-2xl font-bold text-white mb-1">{(parseFloat(stats.volume_24h_ton) * 7).toFixed(2)} TON</div>
              <div className="text-sm text-white/50">≈ $86,415</div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-2">All Time</div>
              <div className="text-2xl font-bold text-white mb-1">{stats.volume_all_time_ton} TON</div>
              <div className="text-sm text-white/50">Total sales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1d29] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                Price History
              </h3>
              {coords.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-white">
                    {(hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx].p : coords[coords.length - 1]?.p || 0).toFixed(3)} TON
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(change).toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {[1, 7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    days === d 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
              <div className="mt-3 text-sm text-white/60">Loading chart data...</div>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="text-red-400 text-sm mb-2">⚠️ {error}</div>
              <button 
                onClick={() => setDays(days)} 
                className="text-xs text-white/60 hover:text-white/80 underline"
              >
                Try again
              </button>
            </div>
          ) : !chartData.length ? (
            <div className="py-20 text-center text-white/60 text-sm">
              No price data available
            </div>
          ) : (
            <div>
            <div className="relative h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} onMouseLeave={() => setHoverIdx(null)} onMouseMove={(state: any) => setHoverIdx(typeof state?.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null)}>
                  <defs>
                    <linearGradient id="re_fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="price"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    tickLine={false}
                    width={60}
                    domain={[minP * 0.995, maxP * 1.005]}
                  />
                  <Tooltip
                    contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${Number(value).toFixed(3)} TON`, 'Price']}
                    labelFormatter={(label) => new Date(Number(label)).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  />
                  <Area type="monotone" dataKey="price" stroke={isPositive ? "#10B981" : "#EF4444"} strokeWidth={2.5} fill="url(#re_fill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Min/Max labels */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white/50">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
                Min: <span className="font-semibold text-white/70">{minP.toFixed(3)} TON</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                Max: <span className="font-semibold text-white/70">{maxP.toFixed(3)} TON</span>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subvalue, 
  trend, 
  positive 
}: { 
  icon: React.ReactNode
  label: string
  value: string | number
  subvalue?: string
  trend?: string
  positive?: boolean
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d29] to-[#151820] p-5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            positive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {trend}
          </div>
        )}
      </div>
      <div className="text-xs text-white/50 mb-1.5 uppercase tracking-wider font-medium">
        {label}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value}
      </div>
      {subvalue && (
        <div className="text-xs text-white/50">
          {subvalue}
        </div>
      )}
    </div>
  )
}