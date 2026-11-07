import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TouchEvent } from 'react'
import { useCarousel } from './use-carousel'

afterEach(() => vi.useRealTimers())
const touch = (x: number) => ({ targetTouches: [{ clientX: x }] }) as unknown as TouchEvent

describe('useCarousel', () => {
  it('wraps and stays valid as the list shrinks or empties', () => {
    const { result, rerender } = renderHook(({ length }) => useCarousel(length), { initialProps: { length: 3 } })
    act(() => result.current.previous())
    expect(result.current.index).toBe(2)
    rerender({ length: 1 })
    expect(result.current.index).toBe(0)
    rerender({ length: 0 })
    act(() => result.current.next())
    expect(result.current.index).toBe(0)
  })
  it('autoplays at the configured interval and cleans up', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useCarousel(3, 5_000))
    act(() => vi.advanceTimersByTime(5_000))
    expect(result.current.index).toBe(1)
    act(() => result.current.goTo(2))
    act(() => vi.advanceTimersByTime(5_000))
    expect(result.current.index).toBe(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('handles swipes at coordinate zero and clears completed gestures', () => {
    const { result } = renderHook(() => useCarousel(3))
    act(() => { result.current.touchHandlers.onTouchStart(touch(100)); result.current.touchHandlers.onTouchMove(touch(0)); result.current.touchHandlers.onTouchEnd() })
    expect(result.current.index).toBe(1)
    act(() => result.current.touchHandlers.onTouchEnd())
    expect(result.current.index).toBe(1)
    act(() => { result.current.touchHandlers.onTouchStart(touch(0)); result.current.touchHandlers.onTouchMove(touch(100)); result.current.touchHandlers.onTouchEnd() })
    expect(result.current.index).toBe(0)
  })
})
