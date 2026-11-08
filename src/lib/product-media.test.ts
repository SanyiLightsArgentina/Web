import { describe, expect, it, vi } from 'vitest'
import { mediaUrlsUsedBy, productMedia, productMediaUrls, removedProductMediaUrls, resolveProductMedia } from './product-media'

describe('product media', () => {
  it('resolves mixed URLs and files in field order without changing the draft', async () => {
    const file = new File(['image'], 'lamp.png', { type: 'image/png' })
    const draft = productMedia()
    draft.images = [{ type: 'url', value: 'existing' }, { type: 'file', value: file }]
    const upload = vi.fn().mockResolvedValue('uploaded')
    expect(await resolveProductMedia(draft, 'Lamp', upload)).toEqual({ images: ['existing', 'uploaded'], contents: [], videos: [] })
    expect(upload).toHaveBeenCalledWith(file, { kind: 'product-image', model: 'Lamp' })
    expect(draft.images[1]).toEqual({ type: 'file', value: file })
  })

  it('rejects a failed upload without losing files so retry is possible', async () => {
    const draft = productMedia()
    const file = new File(['video'], 'lamp.mp4')
    draft.videos = [{ type: 'file', value: file }]
    await expect(resolveProductMedia(draft, 'Lamp', vi.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline')
    expect(draft.videos[0].value).toBe(file)
    await expect(resolveProductMedia(draft, 'Lamp', vi.fn().mockResolvedValue(''))).rejects.toThrow('No se pudo subir')
  })
})

describe('product media ownership', () => {
  const product = (id: number, images: string[], contents: string[] = [], videos: string[] = []) => ({
    id, model: `P${id}`, description: '', category_id: 1, new: false, images, contents, videos,
  })

  it('lists stored URLs and the URLs an edit removes', () => {
    const previous = productMedia(product(1, ['a', 'b'], ['doc']))
    const next = productMedia(product(1, ['a'], ['doc']))
    expect(productMediaUrls(previous)).toEqual(['a', 'b', 'doc'])
    expect(removedProductMediaUrls(previous, next)).toEqual(['b'])
  })

  it('reports URLs still used by another Product', () => {
    const products = [product(1, ['shared', 'own']), product(2, ['shared'])]
    const used = mediaUrlsUsedBy(products, 1)
    expect(used.has('shared')).toBe(true)
    expect(used.has('own')).toBe(false)
  })
})
