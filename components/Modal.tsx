"use client"

import React, { useEffect, useRef, useState } from 'react'

export default function Modal({ open, onClose, title, children, drawerOnMobile = true }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode; drawerOnMobile?: boolean }) {
  const [show, setShow] = useState(open)
  const timeoutRef = useRef<number | null>(null)
  const DURATION = 260 // ms, keep in sync with classes
  const [entered, setEntered] = useState(open)
  const [isMobile, setIsMobile] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [lastT, setLastT] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [vel, setVel] = useState(0)
  const scrollYRef = useRef(0)

  useEffect(() => {
    if (open) {
      // mount immediately on open
      setShow(true)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      // ensure enter transition runs on mount
      requestAnimationFrame(() => setEntered(true))
    } else {
      // delay unmount for fade-out
      setEntered(false)
      timeoutRef.current = window.setTimeout(() => setShow(false), DURATION)
    }
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current) }
  }, [open])

  // lock background scroll when modal visible
  useEffect(() => {
    if (show) {
      // keep current scroll position and lock body
      scrollYRef.current = window.scrollY || 0
      const body = document.body
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.width = '100%'
      body.style.top = `-${scrollYRef.current}px`
      return () => {
        const body = document.body
        body.style.overflow = ''
        body.style.position = ''
        body.style.width = ''
        body.style.top = ''
        window.scrollTo(0, scrollYRef.current)
      }
    }
  }, [show])

  // detect mobile viewport
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    if (!drawerOnMobile || !isMobile) return
    const y = e.touches[0]?.clientY || 0
    setDragging(true)
    setStartY(y)
    setDragY(0)
    const now = performance.now()
    setLastT(now)
    setLastY(y)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!drawerOnMobile || !isMobile || !dragging) return
    const y = e.touches[0]?.clientY || 0
    const dy = Math.max(0, y - startY)
    const now = performance.now()
    const dt = Math.max(1, now - lastT)
    setVel((y - lastY) / dt)
    setLastT(now)
    setLastY(y)
    setDragY(dy)
  }

  const onTouchEnd = () => {
    if (!drawerOnMobile || !isMobile || !dragging) return
    const CLOSE_PX = 120
    const VELOCITY = 0.7 // px/ms
    if (dragY > CLOSE_PX || vel > VELOCITY) {
      setDragging(false)
      setDragY(0)
      onClose()
    } else {
      setDragging(false)
      // animate back
      setDragY(0)
    }
  }

  if (!show) return null

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={
          `absolute transition-all ${dragging ? 'duration-0' : 'duration-300'} ease-out card-glass border border-white/10 p-5 will-change-transform
          ${entered ? 'opacity-100 md:scale-100' : 'opacity-0 md:scale-95'}
          ${drawerOnMobile ? 'bottom-0 left-0 right-0 rounded-t-2xl md:rounded-2xl md:left-1/2 md:top-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl'}
          w-full md:w-[92vw] md:max-w-lg`
        }
        style={drawerOnMobile && isMobile ? { transform: `translateY(${(entered ? 0 : 12) + dragY}px)` } as React.CSSProperties : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile grabber */}
        {drawerOnMobile && isMobile && (
          <div className="flex justify-center mb-2 -mt-1 select-none">
            <div className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl p-1.5">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          className="mt-4 text-sm text-white/80"
          style={drawerOnMobile && isMobile ? { maxHeight: '60vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
