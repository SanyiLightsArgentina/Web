import { describe, expect, it } from 'vitest'
import { buildProductPresentation } from './product-summary'

const product = {
  id: 4,
  model: 'SPL LED/800',
  description: 'LED moving head',
  category_id: 2,
  category_name: 'Moving Head',
  images: ['a.webp', 'b.webp'],
  contents: ['manual.pdf'],
  videos: [],
  new: true,
}

describe('buildProductPresentation', () => {
  it('resolves the fields every surface renders', () => {
    const presentation = buildProductPresentation(product, {
      cardImage: 'card.webp',
      thumbImage: 'thumb.webp',
    })
    expect(presentation).toMatchObject({
      categoryLabel: 'Moving Head',
      cardImage: 'card.webp',
      thumbImage: 'thumb.webp',
      isNew: true,
      categoryId: 2,
    })
    expect(presentation.counts).toEqual({ images: 2, contents: 1, videos: 0 })
    expect(presentation.href).toBe(`/producto/${encodeURIComponent('SPL LED/800')}`)
  })

  it('falls back to the category list, then to a safe label', () => {
    const fromList = buildProductPresentation(
      { ...product, category_name: '' },
      { cardImage: '', thumbImage: '' },
      [{ id: 2, name: 'From list' }],
    )
    expect(fromList.categoryLabel).toBe('From list')

    const unknown = buildProductPresentation(
      { ...product, category_name: '', category_id: 99 },
      { cardImage: '', thumbImage: '' },
      [{ id: 2, name: 'From list' }],
    )
    expect(unknown.categoryLabel).toBe('Sin categoría')
  })

  it('treats missing arrays as zero counts', () => {
    const empty = buildProductPresentation(
      { model: 'X', description: 'Y', category_id: 1, category_name: '', new: false },
      { cardImage: '', thumbImage: '' },
    )
    expect(empty.counts).toEqual({ images: 0, contents: 0, videos: 0 })
  })
})
