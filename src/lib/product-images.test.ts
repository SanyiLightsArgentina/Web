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
      for (let index = 0; index < 1024; index++) productImageUrl(`${root}unknown-${index}.png`, 'card')
      parse.mockClear()
      expect(productImageUrl(first, 'card')).toBe(expected)
      expect(parse).toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('Product image variant layout', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', origin)
  })
  afterEach(() => vi.unstubAllEnvs())

  it('names and recognises variant paths', async () => {
    const { variantPath, originalOfVariant, IMAGE_SIZES } = await import('./product-images')
    for (const size of IMAGE_SIZES) {
      expect(originalOfVariant(variantPath('products/A/id_shot.png', size))).toBe('products/A/id_shot.png')
    }
    expect(originalOfVariant('products/A/id_shot.png')).toBeNull()
    expect(originalOfVariant('products/A/optimized-v1/huge.webp')).toBeNull()
  })

  it('serves, and retires, exactly what an upload stores', async () => {
    const { productImageUrl, IMAGE_SIZES } = await import('./product-images')
    const { createMediaUploadSession, mediaObjectPaths } = await import('./media')
    const stored: string[] = []
    const store = {
      remove: vi.fn(),
      upload: vi.fn(async (bucket: string, path: string) => {
        stored.push(path)
        return `${origin}/storage/v1/object/public/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`
      }),
    }
    const upload = createMediaUploadSession(store, async () => new Blob(['webp'], { type: 'image/webp' }))
    const url = await upload(new File(['x'], 'Foto Ñ.png', { type: 'image/png' }), { kind: 'product-image', model: 'SPL 1' })

    const served = IMAGE_SIZES.map(size => decodeURIComponent(new URL(productImageUrl(url, size)).pathname.split('/product-images/')[1]))
    expect(served.sort()).toEqual([...stored].sort())

    const retired = mediaObjectPaths(url).map(object => object.path)
    expect(retired).toEqual(expect.arrayContaining(stored))
  })

  it('picks the first image of a Product', async () => {
    const { primaryProductImage } = await import('./product-images')
    const detail = `${root}products/A/optimized-v1/detail.webp`
    expect(primaryProductImage({ images: [detail, 'other'] }, 'thumb')).toBe(detail.replace('detail.webp', 'thumb.webp'))
    expect(primaryProductImage({ images: [] }, 'thumb')).toBe('')
    expect(primaryProductImage(undefined, 'card')).toBe('')
  })

  it('rejects animated or non-image uploads before decoding', async () => {
    const { resizeProductImage } = await import('./product-images')
    await expect(resizeProductImage(new File(['x'], 'a.gif', { type: 'image/gif' }), 'card')).rejects.toThrow(/estática/)
    await expect(resizeProductImage(new File(['x'], 'a.pdf', { type: 'application/pdf' }), 'card')).rejects.toThrow(/estática/)
  })
})
