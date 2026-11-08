import { describe, expect, it, vi } from 'vitest'
import type { QueryClient } from '@tanstack/react-query'
import { invalidateAfterWrite } from './query-invalidation'

function fakeClient() {
  return { invalidateQueries: vi.fn(async () => undefined) } as unknown as QueryClient
}

describe('invalidateAfterWrite', () => {
  it('refreshes only the reads a Product write makes stale', async () => {
    const client = fakeClient()
    await invalidateAfterWrite(client, 'product')
    expect(client.invalidateQueries).toHaveBeenCalledExactlyOnceWith({ queryKey: ['products'] })
  })

  it('refreshes Category labels on Products when a Category changes', async () => {
    const client = fakeClient()
    await invalidateAfterWrite(client, 'category')
    expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['products'] })
    expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['categories'] })
  })

  it('refreshes site settings for Category order and Site section saves', async () => {
    for (const kind of ['category-order', 'site-section'] as const) {
      const client = fakeClient()
      await invalidateAfterWrite(client, kind)
      expect(client.invalidateQueries).toHaveBeenCalledExactlyOnceWith({ queryKey: ['site-settings'] })
    }
  })
})
