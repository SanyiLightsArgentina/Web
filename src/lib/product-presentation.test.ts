import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import paths from './optimized-image-paths.json'
import type { CatalogProduct } from './catalog'

const origin = 'https://catalog.example.com'
const root = `${origin}/storage/v1/object/public/product-images/`

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
    expect(presentProduct(row())).toEqual({
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
    const first = list.map(product => presentProduct(product))
    const NativeURL = globalThis.URL
    const parse = vi.fn(function (source: string, base?: string | URL) { return new NativeURL(source, base) })
    vi.stubGlobal('URL', parse)
    try {
      const second = list.map(product => presentProduct(product))
      expect(parse).not.toHaveBeenCalled()
      second.forEach((presentation, index) => expect(presentation).toBe(first[index]))
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('labels from the Category join and presents a refetched row again', async () => {
    const { presentProduct } = await import('./product-presentation')
    const product = row()
    const first = presentProduct(product)
    expect(presentProduct(product)).toBe(first)
    expect(presentProduct(row({ category_name: '' })).categoryLabel).toBe('Sin categoría')

    const refetched = { ...product, images: [], new: false, category_name: 'Cabezales móviles' }
    const next = presentProduct(refetched)
    expect(next).not.toBe(first)
    expect(next).toMatchObject({ categoryLabel: 'Cabezales móviles', cardImage: '', thumbImage: '', isNew: false, counts: { images: 0, contents: 1, videos: 0 } })
  })
})

describe('productFacts', () => {
  it('derives every flag from one row', async () => {
    const { productFacts } = await import('./product-presentation')
    expect(productFacts(row({ images: ['a', 'b'], contents: ['a', 'b'], videos: ['v'] }))).toEqual({
      isNew: true, imageCount: 2, contentCount: 2, videoCount: 1,
      hasPrimaryImage: true, hasMultipleImages: true, hasMultipleContents: true,
      hasVideo: true, hasContent: true, isDescribed: true,
    })
  })

  it('treats missing arrays and descriptions as absent', async () => {
    const { productFacts } = await import('./product-presentation')
    expect(productFacts({ model: 'X', description: '', category_id: 1, new: false })).toMatchObject({
      imageCount: 0, contentCount: 0, videoCount: 0, hasPrimaryImage: false, hasMultipleImages: false,
      hasMultipleContents: false, hasVideo: false, hasContent: false, isDescribed: false, isNew: false,
    })
  })
})
