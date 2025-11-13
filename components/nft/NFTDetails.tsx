"use client"

import { Copy, Check, ExternalLink, FileCode } from 'lucide-react'
import { useState } from 'react'

export default function NFTDetails({ nft, collection }: { nft: any; collection: any }) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (text: string, key: string) => {
    try { 
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    } catch {}
  }

  // Stable, deterministic hash for SSR/CSR consistency
  const stableHash = (str: string) => {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return (h >>> 0)
  }

  const attributes = nft.metadata?.attributes || []

  return (
    <div className="space-y-6">
      {/* Description */}
      {nft.metadata?.description && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Description</h3>
          <p className="text-white/90 leading-relaxed text-[15px]">
            {nft.metadata.description}
          </p>
        </div>
      )}

      {/* Attributes */}
      {attributes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
            Properties
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {attributes.map((attr: any, i: number) => {
              // Calculate rarity percentage (mock data - replace with real data)
              const base = `${nft.token_id}:${attr.trait_type}:${attr.value}`
                const h = stableHash(base)
                const rarity = (h % 26) + 5
              
              return (
                <div 
                  key={i} 
                  className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-blue-500/30 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                  
                  <div className="relative">
                    <div className="text-xs font-medium text-blue-400 mb-1 uppercase tracking-wide">
                      {attr.trait_type}
                    </div>
                    <div className="text-base font-semibold text-white mb-2 truncate">
                      {attr.value}
                    </div>
                    <div className="text-xs text-white/50">
                      {rarity}% have this trait
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Details Section */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Details</h3>
        <div className="space-y-2">
          {/* Contract Address */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-white/20 transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50 mb-1.5 flex items-center gap-2">
                  <FileCode className="h-3.5 w-3.5" />
                  Contract Address
                </div>
                <div className="font-mono text-sm text-white/90 truncate">
                  {collection.contract_address}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => copy(collection.contract_address, 'c')} 
                  className="p-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                  title="Copy address"
                >
                  {copied === 'c' ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white/60 group-hover:text-white/90" />
                  )}
                </button>
                <a
                  href={`https://tonscan.org/address/${collection.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                  title="View on explorer"
                >
                  <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white/90" />
                </a>
              </div>
            </div>
          </div>

          {/* Token ID */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 hover:border-white/20 transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-white/50 mb-1.5">Token ID</div>
                <div className="font-mono text-sm text-white/90">{nft.token_id}</div>
              </div>
              <button 
                onClick={() => copy(nft.token_id, 't')} 
                className="p-2.5 rounded-lg hover:bg-white/10 transition-colors group"
                title="Copy token ID"
              >
                {copied === 't' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-white/60 group-hover:text-white/90" />
                )}
              </button>
            </div>
          </div>

          {/* Token Standard */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50 mb-1.5">Token Standard</div>
                <div className="text-sm text-white/90 font-medium">TON NFT</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs font-semibold text-blue-400">ERC-721</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/50 mb-1.5">Metadata</div>
                <div className="text-sm text-white/90">Centralized</div>
              </div>
              <a
                href="#"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-medium text-white/80 hover:text-white flex items-center gap-1.5"
              >
                <FileCode className="h-3.5 w-3.5" />
                View JSON
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white/90 mb-1">
              Secured by TON Blockchain
            </div>
            <div className="text-xs text-white/60 leading-relaxed">
              This NFT is permanently recorded on the TON blockchain, ensuring true ownership and authenticity.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}