import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { CatalogWriteStore, ProductDraft } from '@/lib/catalog-writes'
import { CatalogWriteError } from '@/lib/catalog-writes'
import { AdminWriteProvider } from './use-admin-write'
import { useCatalogWrites } from './use-catalog-writes'

const draft: ProductDraft = {
  model: 'SPL-LED-800',
  description: 'LED moving head',
  category_id: 2,
  images: [],
  contents: [],
  videos: [],
  new: true,
}

function fakeStore(overrides: Partial<CatalogWriteStore> = {}): CatalogWriteStore {
  return {
    insertProduct: vi.fn(async (input: ProductDraft) => ({ ...input, id: 9 })),
    updateProduct: vi.fn(async () => ({ ...draft, id: 9 })),
    deleteProduct: vi.fn(async () => undefined),
    insertCategory: vi.fn(async (name: string) => ({ id: 1, name })),
    updateCategory: vi.fn(async (id: number, name: string) => ({ id, name })),
    deleteCategory: vi.fn(async () => undefined),
    ...overrides,
  }
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}><AdminWriteProvider>{children}</AdminWriteProvider></QueryClientProvider>
  )
}

describe('useCatalogWrites', () => {
  it('runs the store, invalidates the catalog and records the save', async () => {
    const store = fakeStore()
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useCatalogWrites(store), { wrapper: wrapper(client) })

    await act(async () => {
      await result.current.addProduct(draft)
    })

    expect(store.insertProduct).toHaveBeenCalledWith(draft)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['products'] })
    expect(invalidate).toHaveBeenCalledTimes(1)
    expect(result.current.lastSaved).toBeInstanceOf(Date)
    expect(result.current.isSaving).toBe(false)
  })

  it('propagates the store error and leaves the hook idle', async () => {
    const store = fakeStore({
      deleteProduct: vi.fn(async () => {
        throw new CatalogWriteError('No se pudo eliminar el producto')
      }),
    })
    const client = new QueryClient()
    const { result } = renderHook(() => useCatalogWrites(store), { wrapper: wrapper(client) })

    await act(async () => {
      await expect(result.current.deleteProduct(9, 'SPL-LED-800')).rejects.toThrow(
        'No se pudo eliminar el producto',
      )
    })

    expect(result.current.isSaving).toBe(false)
  })
})
