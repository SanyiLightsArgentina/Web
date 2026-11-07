import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import paths from './optimized-image-paths.json'

const origin = 'https://catalog.example.com'
const root = `${origin}/storage/v1/object/public/product-images/`

describe('productImageUrl', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', origin)
  })
  afterEach(() => vi.unstubAllEnvs())

  it('keeps sizes separate and preserves encoded paths, query strings and hashes', async () => {
    const { productImageUrl } = await import('./product-images')
    const source = `${root}${paths[0]}?download=1#image`
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const size of ['card', 'thumb', 'detail'] as const) {
        const expected = new URL(source)
        expected.pathname += `/optimized-v1/${size}.webp`
        expect(productImageUrl(source, size)).toBe(expected.href)
      }
    }
  })

  it('rewrites uploaded detail variants and passes unknown or invalid sources through', async () => {
    const { productImageUrl } = await import('./product-images')
    const detail = `${root}products/new/optimized-v1/detail.webp?token=x#photo`
    expect(productImageUrl(detail, 'thumb')).toBe(detail.replace('detail.webp', 'thumb.webp'))
    for (const source of [undefined, '', '/local.png', 'not a URL', `${root}unknown.png`, `${root}%ZZ`, `https://other.example.com/storage/v1/object/public/product-images/${paths[0]}`, `${origin}/other/${paths[0]}`]) {
      expect(productImageUrl(source, 'card')).toBe(source || '')
      expect(productImageUrl(source, 'card')).toBe(source || '')
    }
  })

  it('reuses parsed results and evicts the oldest entry at the cache limit', async () => {
    const { productImageUrl } = await import('./product-images')
    const NativeURL = globalThis.URL
    const parse = vi.fn(function (source: string, base?: string | URL) { return new NativeURL(source, base) })
    vi.stubGlobal('URL', parse)
    try {
      const first = `${root}${paths[0]}`
      const expected = productImageUrl(first, 'card')
      expect(parse).toHaveBeenCalled()
      parse.mockClear()
      expect(productImageUrl(first, 'card')).toBe(expected)
      expect(parse).not.toHaveBeenCalled()
      for (let index = 0; index < 256; index++) productImageUrl(`${root}unknown-${index}.png`, 'card')
      parse.mockClear()
      expect(productImageUrl(first, 'card')).toBe(expected)
      expect(parse).toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
