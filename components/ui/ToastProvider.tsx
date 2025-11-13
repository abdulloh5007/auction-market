"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type ToastOptions = {
  id?: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number // ms
  onClick?: () => void
}

type ToastInternal = ToastOptions & { id: string; createdAt: number }

type ToastContextType = {
  show: (opts: ToastOptions) => string
  success: (message: string, opts?: Omit<ToastOptions, 'message' | 'type'>) => string
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([])
  const timers = useRef<Map<string, any>>(new Map())
  const [closing, setClosing] = useState<Record<string, boolean>>({})

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const tm = timers.current.get(id)
    if (tm) {
      clearTimeout(tm)
      timers.current.delete(id)
    }
  }, [])

  const enqueueAutoHide = useCallback((t: ToastInternal) => {
    // Default durations:
    // - Simple toast (no onClick): 5s
    // - Clickable toast (with onClick): 10s
    const duration = t.duration ?? (t.onClick ? 10000 : 5000)
    const tm = setTimeout(() => close(t.id), duration)
    timers.current.set(t.id, tm)
  }, [remove])

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id || Math.random().toString(36).slice(2)
    const toast: ToastInternal = { id, createdAt: Date.now(), type: 'info', ...opts }
    setToasts((prev) => [toast, ...prev])
    enqueueAutoHide(toast)
    return id
  }, [enqueueAutoHide])

  const success = useCallback((message: string, opts?: Omit<ToastOptions, 'message' | 'type'>) => {
    return show({ message, type: 'success', ...opts })
  }, [show])

  const close = useCallback((id: string) => {
    // Start exit animation
    setClosing((prev) => ({ ...prev, [id]: true }))
    // Clear existing auto-hide timer (if any)
    const tm = timers.current.get(id)
    if (tm) {
      clearTimeout(tm)
      timers.current.delete(id)
    }
    // After animation delay, remove
    const exitMs = 250
    const exitTimer = setTimeout(() => {
      setClosing((prev) => {
        const n = { ...prev }
        delete n[id]
        return n
      })
      remove(id)
    }, exitMs)
    timers.current.set(id, exitTimer)
  }, [remove])

  const ctxValue = useMemo(() => ({ show, success, remove: close }), [close, show, success])

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      {/* Toast viewport */}
      <div className="fixed left-4 bottom-4 z-50 space-y-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} closing={!!closing[t.id]} onClose={() => close(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, closing, onClose }: { toast: ToastInternal; closing?: boolean; onClose: () => void }) {
  const [enter, setEnter] = useState(false)
  const pauseRef = useRef(false)

  useEffect(() => {
    const id = setTimeout(() => setEnter(true), 10)
    return () => clearTimeout(id)
  }, [])

  const handleToastClick = (e: React.MouseEvent) => {
    // Don't trigger toast onClick if the close button was clicked
    if ((e.target as HTMLElement).closest('[data-close-button]')) {
      return
    }
    toast.onClick?.()
  }

  return (
    <div
      onClick={handleToastClick}
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
      className={`group flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 card-glass border border-white/10 ${
        toast.type === 'success' ? 'bg-emerald-500/15 text-emerald-100' : toast.type === 'error' ? 'bg-red-500/15 text-red-100' : 'bg-white/10 text-white'
      } ${closing ? 'opacity-0 -translate-x-5' : (enter ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5')} ${toast.onClick ? 'cursor-pointer' : ''}`}
      style={{ minWidth: 260 }}
    >
      {/* Check icon */}
      {toast.type === 'success' ? (
        <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : toast.type === 'error' ? (
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )}
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{toast.message}</div>
      </div>
      <div className="opacity-50 group-hover:opacity-100 transition-opacity">
        {/* Arrow icon */}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
      <div>
        <button
          data-close-button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="ml-2 text-white/60 hover:text-white"
        >
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
