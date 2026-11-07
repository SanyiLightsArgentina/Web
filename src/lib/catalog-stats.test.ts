import { describe, expect, it } from 'vitest'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import { summarizeCatalog } from './catalog-stats'

const product = (overrides: Partial<Product> & Pick<Product, 'model' | 'category_id'>): Product => ({
  description: '',
  new: false,
  ...overrides,
})

describe('summarizeCatalog', () => {
  it('collects every overview metric and the category distribution in one pass', () => {
    const categories: Category[] = [
      { id: 1, name: 'Moving Heads' },
      { id: 2, name: 'Lasers' },
      { id: 3, name: 'Empty' },
    ]
    const products: Product[] = [
      product({
        model: 'A',
        category_id: 1,
        description: 'A description',
        new: true,
        images: ['a.webp'],
        contents: ['manual.pdf', 'spec.png'],
        videos: ['https://youtu.be/aaaaaaaaaaa'],
      }),
      product({
        model: 'B',
        category_id: 1,
        contents: ['manual.pdf'],
      }),
      product({
        model: 'C',
        category_id: 2,
        description: 'C description',
        images: ['c1.webp', 'c2.webp'],
        videos: ['https://youtu.be/ccccccccccc'],
      }),
      product({
        model: 'D',
        category_id: 2,
        description: 'D description',
        new: true,
      }),
    ]

    expect(summarizeCatalog(products, categories)).toEqual({
      totalProducts: 4,
      newProducts: 2,
      productsWithVideo: 2,
      productsWithSecondaryImage: 1,
      productsWithMultipleImages: 1,
      describedProducts: 3,
      productsWithPrimaryImage: 2,
      productsWithContent: 2,
      categoryStats: [
        { name: 'Moving Heads', count: 2, percentage: 50 },
        { name: 'Lasers', count: 2, percentage: 50 },
        { name: 'Empty', count: 0, percentage: 0 },
      ],
    })
  })

  it('reports zero percentages for an empty catalog while keeping every category', () => {
    const categories: Category[] = [{ id: 4, name: 'Only category' }]

    expect(summarizeCatalog([], categories)).toEqual({
      totalProducts: 0,
      newProducts: 0,
      productsWithVideo: 0,
      productsWithSecondaryImage: 0,
      productsWithMultipleImages: 0,
      describedProducts: 0,
      productsWithPrimaryImage: 0,
      productsWithContent: 0,
      categoryStats: [{ name: 'Only category', count: 0, percentage: 0 }],
    })
  })

  it('skips holes in sparse catalogs like Array#filter did', () => {
    const products = new Array<Product>(3)
    products[0] = product({ model: 'A', category_id: 1, new: true })
    products[2] = product({ model: 'C', category_id: 1 })

    const summary = summarizeCatalog(products, [{ id: 1, name: 'Category' }])

    expect(summary.totalProducts).toBe(3)
    expect(summary.newProducts).toBe(1)
    expect(summary.categoryStats[0]).toEqual({ name: 'Category', count: 2, percentage: (2 / 3) * 100 })
  })

  it('does not mutate the catalog or the category order', () => {
    const categories: Category[] = [{ id: 2, name: 'Second' }, { id: 1, name: 'First' }]
    const products: Product[] = [
      product({ model: 'A', category_id: 1 }),
      product({ model: 'B', category_id: 2 }),
    ]

    summarizeCatalog(products, categories)

    expect(categories.map(category => category.name)).toEqual(['Second', 'First'])
    expect(products.map(item => item.model)).toEqual(['A', 'B'])
  })
})
