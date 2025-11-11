"use client"

import { nfts } from '@/data/nfts'
import { prepareTestnetTransfer } from '@/lib/tonTransfer'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { useToast } from './ToastProvider'
import Modal from './Modal'

export default function NFTGrid() {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const userFriendlyAddress = useTonAddress()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [txDetails, setTxDetails] = useState<{ from?: string; to?: string; amount?: number; nftId?: string } | null>(null)

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
      setStatus('✅ Transaction submitted! Check your wallet for confirmation.')

      setTxDetails({ from: userFriendlyAddress, to, amount: valueTon, nftId: id })

      // Show toast bottom-left with success styling; clicking opens modal
      toast.success('Транзакция успешно отправлена', {
        onClick: () => setModalOpen(true),
      })
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
      <div className="text-white/80">Mock NFT</div>
      {status && <div className="text-sm text-white/70">{status}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nfts.map((n) => (
          <div key={n.id} className="card-glass p-3">
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image src={n.src} alt={n.title} fill className="object-cover" />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-white/60">{n.description}</div>
              </div>
              <div className="text-accent-300 font-semibold">{n.value} TON</div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="btn-primary disabled:opacity-60"
                disabled={busyId === n.id || !wallet}
                onClick={() => onBuy(n.id, n.value)}
              >
                {busyId === n.id ? 'Processing...' : wallet ? 'Buy' : 'Connect wallet to buy'}
              </button>
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
