import { describe, expect, it } from 'vitest'
import {
  contentTypeFor,
  mediaDestination,
  mediaObjectPaths,
  sanitizePathSegment,
  validateMedia,
} from './media'

const fakeFile = (name: string, type: string, size: number): File => ({ name, type, size }) as File

const image = fakeFile('Studio Shot.PNG', 'image/png', 1200)
const pdf = fakeFile('manual técnico.pdf', 'application/pdf', 1200)
const video = fakeFile('demo.webm', 'video/webm', 1200)

describe('media paths', () => {
  it('sanitizes every path segment', () => {
    expect(sanitizePathSegment('SPL LED/800')).toBe('SPL_LED_800')
    expect(sanitizePathSegment('   ')).toBe('archivo')
  })

  it('keeps product assets inside the product namespace', () => {
    expect(mediaDestination({ kind: 'product-image', model: 'SPL LED/800' }, image, 'id1')).toEqual({
      bucket: 'product-images',
      path: 'products/SPL_LED_800/id1_Studio_Shot.PNG',
      cacheControl: '31536000',
    })
    expect(mediaDestination({ kind: 'product-content', model: 'A' }, image, 'id2').path)
      .toBe('products/A/content/images/id2_Studio_Shot.PNG')
    expect(mediaDestination({ kind: 'product-content', model: 'A' }, pdf, 'id3').path)
      .toBe('products/A/content/documents/id3_manual_te_cnico.pdf')
    expect(mediaDestination({ kind: 'product-video', model: 'A' }, video, 'id4').path)
      .toBe('products/A/videos/id4.webm')
  })

  it('keeps site media out of the product namespace', () => {
    expect(mediaDestination({ kind: 'site-video', section: 'hero' }, video, 'id5').path)
      .toBe('site/hero/id5.webm')
    expect(mediaDestination({ kind: 'client-logo', clientId: 'client 1' }, image, 'id6').path)
      .toBe('clients/client_1/id6.png')
  })

  it('maps mp4 names to the right content type', () => {
    expect(contentTypeFor(fakeFile('clip.MP4', '', 100))).toBe('video/mp4')
  })
})

describe('media validation', () => {
  it('accepts the supported logo formats and rejects the rest', () => {
    expect(validateMedia({ kind: 'client-logo', clientId: '1' }, image)).toBeNull()
    expect(validateMedia({ kind: 'client-logo', clientId: '1' }, fakeFile('x.gif', 'image/gif', 1200))).toMatch(/PNG/)
    expect(validateMedia({ kind: 'client-logo', clientId: '1' }, fakeFile('x.png', 'image/png', 10 * 1024 * 1024 + 1))).toMatch(/10 MB/)
  })

  it('rejects gifs, non-videos and empty files', () => {
    expect(validateMedia({ kind: 'product-image', model: 'A' }, fakeFile('x.gif', 'image/gif', 1200))).toMatch(/estática/)
    expect(validateMedia({ kind: 'product-video', model: 'A' }, fakeFile('x.txt', 'text/plain', 10))).toMatch(/video/)
    expect(validateMedia({ kind: 'product-content', model: 'A' }, fakeFile('x.pdf', 'application/pdf', 0))).toMatch(/vacío/)
    expect(validateMedia({ kind: 'site-video', section: 'videos' }, video)).toBeNull()
  })
})

describe('media removal', () => {
  const publicUrl = (bucket: string, path: string) => `https://project.supabase.co/storage/v1/object/public/${bucket}/${path}`

  it('resolves the original Product image and every optimized variant', () => {
    const original = publicUrl('product-images', 'products/A/id_shot.png')
    const detail = publicUrl('product-images', 'products/A/id_shot.png/optimized-v1/detail.webp')
    const expected = [
      { bucket: 'product-images', path: 'products/A/id_shot.png' },
      { bucket: 'product-images', path: 'products/A/id_shot.png/optimized-v1/thumb.webp' },
      { bucket: 'product-images', path: 'products/A/id_shot.png/optimized-v1/card.webp' },
      { bucket: 'product-images', path: 'products/A/id_shot.png/optimized-v1/detail.webp' },
    ]
    expect(mediaObjectPaths(original)).toEqual(expected)
    expect(mediaObjectPaths(detail)).toEqual(expected)
  })

  it('leaves non-image and foreign URLs alone', () => {
    expect(mediaObjectPaths(publicUrl('product-images', 'clients/1/logo.png'))).toEqual([
      { bucket: 'product-images', path: 'clients/1/logo.png' },
    ])
    expect(mediaObjectPaths(publicUrl('product-videos', 'products/A/videos/id.mp4'))).toEqual([
      { bucket: 'product-videos', path: 'products/A/videos/id.mp4' },
    ])
    expect(mediaObjectPaths('https://example.com/photo.png')).toEqual([])
    expect(mediaObjectPaths('not a url')).toEqual([])
  })
})

describe('managed media namespaces', () => {
  it('only lets publication retire objects this site uploads', async () => {
    const { isManagedMediaObject } = await import('./media')
    expect(isManagedMediaObject({ bucket: 'product-content', path: 'products/A/content/documents/x.pdf' })).toBe(true)
    expect(isManagedMediaObject({ bucket: 'product-videos', path: 'site/hero/x.mp4' })).toBe(true)
    expect(isManagedMediaObject({ bucket: 'product-images', path: 'clients/1/x.png' })).toBe(true)
    expect(isManagedMediaObject({ bucket: 'product-images', path: 'site/hero/x.mp4' })).toBe(false)
    expect(isManagedMediaObject({ bucket: 'product-videos', path: 'manual/intro.mp4' })).toBe(false)
    expect(isManagedMediaObject({ bucket: 'other', path: 'products/A/x.png' })).toBe(false)
  })
})
