# TON Next.js (App Router) Starter

A minimal Next.js 14 + TypeScript + TailwindCSS starter with basic TON Connect integration (testnet), TON price card, and mock NFT grid. Inspired by Tonkeeper / MyTonWallet dark UI.

## Features
- App Router (Next.js 14+)
- TypeScript
- TailwindCSS (dark, tinted black/gray UI)
- TON Connect manifest + basic connect/disconnect
- TON price fetched via public API (TonAPI or CoinGecko)
- Mock offchain NFT list with Buy action (test transaction placeholder)

## Getting Started
1. Install dependencies
```bash
npm install
```

2. Configure environment
- Copy `.env.local.example` to `.env.local`
- Fill `TONAPI_KEY` if you plan to use TonAPI endpoints (optional — CoinGecko fallback is included)

3. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000 to see the app.

## Env
- `NEXT_PUBLIC_TONCONNECT_MANIFEST_URL` (optional) — URL to `public/tonconnect-manifest.json`. Defaults to `/tonconnect-manifest.json`.
- `TONAPI_KEY` (optional) — TonAPI key for price.

## Scripts
- `dev`: next dev
- `build`: next build
- `start`: next start
- `lint`: next lint

## TODO mapping
See `TODO.md`. This starter checks off most items: project init, Tailwind, basic UI, connect wallet, price card, mock NFT list, and a stub for sending a transfer on testnet.

## Notes
- The actual on-chain transfer requires a connected wallet (testnet). The Buy button prepares a transaction request stub you can wire to your backend or directly to TON Connect sendTransaction.
- This is a baseline for further polishing (skeleton, toasts, animations).
