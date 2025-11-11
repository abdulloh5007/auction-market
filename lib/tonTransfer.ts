export function prepareTestnetTransfer({
  to,
  amountTon,
  payload,
}: {
  to: string
  amountTon: number
  payload?: string
}) {
  // nanoTON (1 TON = 1e9 nano)
  const amount = Math.round(amountTon * 1e9)
  return {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: to,
        amount: amount.toString(),
        // NOTE: payload must be base64-encoded BOC. We skip attaching until proper encoder is added.
      },
    ],
  }
}
