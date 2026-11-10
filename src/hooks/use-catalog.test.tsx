import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { CatalogReadStore } from '@/lib/catalog-store'
import { parseSiteSettings, type SiteSettings } from '@/lib/site-settings'
import { backendWrapper } from '@/test/backend'
import { useCatalog } from './use-catalog'

const products = [
  { id: 1, model: 'A', description: '', category_id: 2, new: false, images: [], contents: [], videos: [] },
  { id: 2, model: 'B', description: '', category_id: 1, new: true, images: [], contents: [], videos: [] },
]

function store(overrides: Partial<CatalogReadStore> = {}): CatalogReadStore {
  return {
    loadProducts: vi.fn(async () => products),
    loadCategories: vi.fn(async () => [{ id: 1, name: 'Lights' }, { id: 2, name: 'Heads' }]),
    loadSiteSettings: vi.fn(async () => parseSiteSettings([{ key: 'category_order', value: [2, 1] }])),
    ...overrides,
  }
}

function wrapper(read: CatalogReadStore) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return backendWrapper({ catalog: read }, ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  ))
}

describe('useCatalog', () => {
  it('joins Products and applies the Category order through the injected store', async () => {
    const read = store()
    const { result } = renderHook(() => useCatalog(), { wrapper: wrapper(read) })

    await waitFor(() => expect(result.current.categoryOrderReady).toBe(true))

    expect(result.current.categories.map(category => category.id)).toEqual([2, 1])
    expect(result.current.products.find(product => product.model === 'A')?.category_name).toBe('Heads')
    expect(read.loadProducts).toHaveBeenCalledOnce()
  })

  it('surfaces a site settings failure instead of hiding it behind defaults', async () => {
    const read = store({ loadSiteSettings: vi.fn(async () => { throw new Error('settings offline') }) })
    const { result } = renderHook(() => useCatalog(), { wrapper: wrapper(read) })

    await waitFor(() => expect(result.current.error?.message).toBe('settings offline'))
  })
})

it('exposes the catalog before the saved Category order is ready', async () => {
  let resolveOrder!: (settings: SiteSettings) => void
  const read = store({ loadSiteSettings: () => new Promise(resolve => { resolveOrder = resolve }) })
  const { result } = renderHook(() => useCatalog(), { wrapper: wrapper(read) })

  await waitFor(() => expect(result.current.isLoaded).toBe(true))
  expect(result.current.categoryOrderReady).toBe(false)
  expect(result.current.categories.map(category => category.id)).toEqual([2, 1])

  resolveOrder(parseSiteSettings([{ key: 'category_order', value: [1, 2] }]))
  await waitFor(() => expect(result.current.categoryOrderReady).toBe(true))
  expect(result.current.categories.map(category => category.id)).toEqual([1, 2])
})
