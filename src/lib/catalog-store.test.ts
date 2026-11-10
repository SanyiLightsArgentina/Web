import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { createSupabaseCatalogStore } from './catalog-store'
import { parseSiteSettings } from './site-settings'

type Response = { data?: unknown[] | null; count?: number; error?: { message: string; code?: string } | null }

function fakeClient(responses: Record<string, Response>): SupabaseClient {
  return {
    from(table: string) {
      const response = responses[table] ?? { data: [], error: null }
      return {
        select: () => Object.assign(Promise.resolve(response), { order: async () => response }),
      }
    },
  } as unknown as SupabaseClient
}

describe('Supabase catalog read store', () => {
  it('returns Products and Categories', async () => {
    const store = createSupabaseCatalogStore(fakeClient({
      products: { data: [{ id: 1, model: 'A' }], error: null },
      categories: { data: [{ id: 1, name: 'Lights' }], error: null },
    }))
    await expect(store.loadProducts()).resolves.toEqual([{ id: 1, model: 'A' }])
    await expect(store.loadCategories()).resolves.toEqual([{ id: 1, name: 'Lights' }])
  })

  it('normalizes read failures into one message per read', async () => {
    const store = createSupabaseCatalogStore(fakeClient({
      products: { error: { message: 'boom' } },
      categories: { error: { message: 'boom' } },
    }))
    await expect(store.loadProducts()).rejects.toThrow('No se pudieron cargar los productos')
    await expect(store.loadCategories()).rejects.toThrow('No se pudieron cargar las categorías')
  })

  it('parses site settings rows', async () => {
    const store = createSupabaseCatalogStore(fakeClient({
      site_settings: { data: [{ key: 'category_order', value: [3, 1] }], error: null },
    }))
    await expect(store.loadSiteSettings()).resolves.toEqual(
      parseSiteSettings([{ key: 'category_order', value: [3, 1] }])
    )
  })

  it('keeps default content when the settings table is not migrated yet', async () => {
    const store = createSupabaseCatalogStore(fakeClient({
      site_settings: { error: { message: 'missing', code: 'PGRST205' } },
    }))
    await expect(store.loadSiteSettings()).resolves.toEqual(parseSiteSettings(null))
  })

  it('reports other settings failures', async () => {
    const store = createSupabaseCatalogStore(fakeClient({
      site_settings: { error: { message: 'offline', code: '500' } },
    }))
    await expect(store.loadSiteSettings()).rejects.toThrow('No se pudo cargar la configuración del sitio')
  })
})


it('rejects incomplete Product media references before cleanup', async () => {
  const data = [{ images: ['https://example.com/light.jpg'] }]
  const complete = createSupabaseCatalogStore(fakeClient({ products: { data, count: 1 } }))
  await expect(complete.loadProductMedia()).resolves.toEqual(data)

  const capped = createSupabaseCatalogStore(fakeClient({ products: { data, count: 2 } }))
  await expect(capped.loadProductMedia()).rejects.toThrow('verificar los archivos')
})

it('collects media every Product and Site section references', async () => {
  const store = createSupabaseCatalogStore(fakeClient({
    products: { data: [{ images: ['image'], contents: ['manual'], videos: null }], count: 1 },
    site_settings: { data: [
      { key: 'clients', value: [{ id: '1', company: 'Co', logo: 'https://example.com/logo.png', link: '' }] },
      { key: 'videos', value: { items: [{ id: 'v', title: 'Demo', url: 'https://example.com/demo.mp4' }], channelUrl: '' } },
    ], error: null },
  }))
  const urls = await store.loadReferencedMediaUrls()
  expect(urls).toEqual(expect.arrayContaining(['image', 'manual', 'https://example.com/logo.png', 'https://example.com/demo.mp4']))
  expect(urls).toEqual(expect.arrayContaining(parseSiteSettings(null).hero.map(slide => slide.src)))
})

it('refuses to report references when Site settings cannot be read', async () => {
  const store = createSupabaseCatalogStore(fakeClient({
    products: { data: [], count: 0 },
    site_settings: { error: { message: 'offline', code: '500' } },
  }))
  await expect(store.loadReferencedMediaUrls()).rejects.toThrow()
})
