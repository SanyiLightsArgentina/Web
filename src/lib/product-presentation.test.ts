import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import paths from './optimized-image-paths.json'
import type { CatalogProduct, Category } from './catalog'

const origin = 'https://catalog.example.com'
const root = `${origin}/storage/v1/object/public/product-images/`
const categories: Category[] = [{ id: 1, name: 'Cabezales' }]

const row = (overrides: Partial<CatalogProduct> = {}): CatalogProduct => ({
  id: 7,
  model: 'SPL 300/B',
  description: 'Cabezal móvil',
  category_id: 1,
  category_name: 'Cabezales',
  new: true,
  images: [`${root}${paths[0]}`],
  contents: ['https://example.com/manual.pdf'],
  videos: [],
  ...overrides,
})

describe('presentProduct', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', origin)
  })
  afterEach(() => vi.unstubAllEnvs())

  it('presents the row with optimized images, label, counts and route', async () => {
    const { presentProduct } = await import('./product-presentation')
    expect(presentProduct(row(), categories)).toEqual({
      id: 7,
      model: 'SPL 300/B',
      description: 'Cabezal móvil',
      categoryId: 1,
      categoryLabel: 'Cabezales',
      cardImage: `${new URL(`${root}${paths[0]}`).href}/optimized-v1/card.webp`,
      thumbImage: `${new URL(`${root}${paths[0]}`).href}/optimized-v1/thumb.webp`,
      isNew: true,
      counts: { images: 1, contents: 1, videos: 0 },
      href: '/producto/SPL%20300%2FB',
    })
  })

  it('reuses the presentation of an unchanged row across a full admin list', async () => {
    const { presentProduct } = await import('./product-presentation')
    // More rows than the image URL cache can hold for card and thumb sizes.
    const list = Array.from({ length: 600 }, (_, index) => row({ id: index, model: `M${index}`, images: [`${root}products/${index}.png`] }))
    const first = list.map(product => presentProduct(product, categories))
    const NativeURL = globalThis.URL
    const parse = vi.fn(function (source: string, base?: string | URL) { return new NativeURL(source, base) })
    vi.stubGlobal('URL', parse)
    try {
      const second = list.map(product => presentProduct(product, categories))
      expect(parse).not.toHaveBeenCalled()
      second.forEach((presentation, index) => expect(presentation).toBe(first[index]))
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('presents again for a new row or a different category list', async () => {
    const { presentProduct } = await import('./product-presentation')
    const product = row({ category_name: '' })
    const first = presentProduct(product, categories)
    expect(first.categoryLabel).toBe('Cabezales')

    const renamed = [{ id: 1, name: 'Cabezales móviles' }]
    expect(presentProduct(product, renamed).categoryLabel).toBe('Cabezales móviles')
    expect(presentProduct(product).categoryLabel).toBe('Sin categoría')
    expect(presentProduct(product)).toBe(presentProduct(product))

    const refetched = { ...product, images: [], new: false }
    const next = presentProduct(refetched, categories)
    expect(next).not.toBe(first)
    expect(next).toMatchObject({ cardImage: '', thumbImage: '', isNew: false, counts: { images: 0, contents: 1, videos: 0 } })
  })
})
