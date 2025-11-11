import Header from '@/components/Header'
import NFTGrid from '@/components/NFTGrid'

export default function Page() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-start gap-6 text-center">
      <div className="w-full max-w-5xl px-4">
        <NFTGrid />
      </div>
    </main>
  )
}
