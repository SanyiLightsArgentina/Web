import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { CatalogReadStore } from '@/lib/catalog-store'
import { parseSiteSettings } from '@/lib/site-settings'
import { useSiteSettings } from './use-site-settings'

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useSiteSettings', () => {
  it('reads site settings through the injected store', async () => {
    const read: CatalogReadStore = {
      loadProducts: vi.fn(async () => []),
      loadCategories: vi.fn(async () => []),
      loadSiteSettings: vi.fn(async () => parseSiteSettings([
        { key: 'contact', value: { phone: '5491100000000' } },
      ])),
    }
    const { result } = renderHook(() => useSiteSettings(read), { wrapper: wrapper() })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.settings.contact.phone).toBe('5491100000000')
  })
})
