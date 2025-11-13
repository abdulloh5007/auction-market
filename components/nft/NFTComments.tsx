"use client"

import { useState } from 'react'

export default function NFTComments({ tokenId }: { tokenId: string }) {
  const [text, setText] = useState('')
  const [comments, setComments] = useState<{ id: string; text: string; at: number }[]>([])

  const submit = () => {
    if (!text.trim()) return
    setComments((arr) => [{ id: `${Date.now()}`, text, at: Date.now() }, ...arr])
    setText('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-accent-400"
        />
        <button onClick={submit} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Send</button>
      </div>

      {comments.length === 0 ? (
        <div className="text-white/60 text-sm">No comments yet</div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm">{c.text}</div>
              <div className="text-xs text-white/50">{new Date(c.at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
