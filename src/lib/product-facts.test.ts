import { describe, expect, it } from 'vitest'
import { productFacts } from './product-facts'

const row = {
  model: 'SPL-LED-800',
  description: 'LED moving head',
  category_id: 2,
  category_name: '',
  images: ['a.webp', 'b.webp'],
  contents: ['manual.pdf', 'spec.png'],
  videos: ['https://youtu.be/aaaaaaaaaaa'],
  new: true,
}

describe('productFacts', () => {
  it('derives every flag from one row', () => {
    expect(productFacts(row, [{ id: 2, name: 'Moving Head' }])).toEqual({
      categoryLabel: 'Moving Head',
      isNew: true,
      imageCount: 2,
      contentCount: 2,
      videoCount: 1,
      hasPrimaryImage: true,
      hasMultipleImages: true,
      hasMultipleContents: true,
      hasVideo: true,
      hasContent: true,
      isDescribed: true,
    })
  })

  it('prefers the joined label and falls back safely', () => {
    expect(productFacts({ ...row, category_name: 'Joined' }).categoryLabel).toBe('Joined')
    expect(productFacts({ ...row, category_name: '', category_id: 99 }).categoryLabel).toBe('Sin categoría')
  })

  it('treats missing arrays and descriptions as absent', () => {
    const empty = productFacts({ model: 'X', description: '', category_id: 1, new: false })
    expect(empty).toMatchObject({
      imageCount: 0,
      contentCount: 0,
      videoCount: 0,
      hasPrimaryImage: false,
      hasMultipleImages: false,
      hasMultipleContents: false,
      hasVideo: false,
      hasContent: false,
      isDescribed: false,
      isNew: false,
    })
  })
})
