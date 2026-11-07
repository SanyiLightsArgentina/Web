import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'

/** Shared index/wrap/timer behavior; image loading remains with each caller. */
export function useCarousel(length: number, intervalMs: number | null = null) {
  const [position, setPosition] = useState(0)
  const wrap = useCallback((value: number) => length > 0 ? ((value % length) + length) % length : 0, [length])
  const index = wrap(position)
  const next = useCallback(() => setPosition(p => wrap(p) + 1), [wrap])
  const previous = useCallback(() => setPosition(p => wrap(p) - 1), [wrap])
  const goTo = (value: number) => setPosition(wrap(value))
  const touch = useRef<{ start: number; end: number | null } | null>(null)

  useEffect(() => {
    if (length < 2 || intervalMs === null || intervalMs <= 0) return
    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [length, intervalMs, next])

  const onTouchStart = (event: TouchEvent) => {
    const point = event.targetTouches[0]
    touch.current = point ? { start: point.clientX, end: null } : null
  }
  const onTouchMove = (event: TouchEvent) => {
    if (touch.current && event.targetTouches[0]) touch.current.end = event.targetTouches[0].clientX
  }
  const onTouchEnd = () => {
    const gesture = touch.current
    touch.current = null
    if (!gesture || gesture.end === null) return
    const distance = gesture.start - gesture.end
    if (distance > 50) next()
    if (distance < -50) previous()
  }
  return { index, next, previous, goTo, touchHandlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: () => { touch.current = null } } }
}
