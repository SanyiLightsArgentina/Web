import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  CatalogWriteError,
  createSupabaseCatalogWrites,
  productWritePayload,
  type ProductDraft,
} from './catalog-writes'

// Shaped like a row read back from the database, including server-managed fields.
const draft = {
  id: 7,
  created_at: '2026-01-01',
  updated_at: '2026-01-02',
  model: 'SPL-LED-800',
  description: 'LED moving head',
  category_id: 2,
  images: ['https://example.com/a.webp'],
  contents: [],
  videos: [],
  new: true,
} as ProductDraft & { created_at: string; updated_at: string }

type Response = { data?: unknown[] | null; error?: { message: string } | null }

function fakeClient(response: Response): SupabaseClient {
  return {
    from: () => ({
      insert: () => ({ select: async () => response }),
      update: () => ({ eq: () => ({ select: async () => response }) }),
      delete: () => ({ eq: async () => response }),
    }),
  } as unknown as SupabaseClient
}

describe('productWritePayload', () => {
  it('strips identity and server-managed timestamps', () => {
    const payload = productWritePayload(draft)
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('created_at')
    expect(payload).not.toHaveProperty('updated_at')
    expect(payload).toEqual({
      model: 'SPL-LED-800',
      description: 'LED moving head',
      category_id: 2,
      images: ['https://example.com/a.webp'],
      contents: [],
      videos: [],
      new: true,
    })
  })
})

describe('Supabase catalog store', () => {
  it('returns the inserted row', async () => {
    const row = { id: 8, model: 'SPL-LED-800' }
    const store = createSupabaseCatalogWrites(fakeClient({ data: [row], error: null }))
    await expect(store.insertProduct(draft)).resolves.toEqual(row)
  })

  it('normalizes insert failures into one error type', async () => {
    const store = createSupabaseCatalogWrites(fakeClient({ error: { message: 'boom' } }))
    await expect(store.insertProduct(draft)).rejects.toBeInstanceOf(CatalogWriteError)
    await expect(store.insertProduct(draft)).rejects.toThrow('No se pudo agregar el producto: boom')
  })

  it('deletes by id without returning a row', async () => {
    const store = createSupabaseCatalogWrites(fakeClient({ error: null }))
    await expect(store.deleteProduct(8)).resolves.toBeUndefined()
  })

  it('reports category write failures through the same type', async () => {
    const store = createSupabaseCatalogWrites(fakeClient({ error: { message: 'duplicate' } }))
    await expect(store.insertCategory('Laser')).rejects.toBeInstanceOf(CatalogWriteError)
  })
})
