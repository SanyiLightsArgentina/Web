import { describe, expect, it } from 'vitest'
import {
  filterProducts,
  getFeaturedProducts,
  getProductsByCategoryId,
  searchProducts,
} from './product-utils'

const categories = [
  { id: 1, name: 'Moving Head' },
  { id: 2, name: 'Wash Light' },
]

const products = [
  { model: 'SPL-LED-800', description: 'LED moving head', category_id: 1, new: true },
  { model: 'SPL-COB-200', description: 'Wash light cob', category_id: 2, new: false },
  { model: 'ab', description: 'cd', category_id: 1, new: false },
  { model: 'LED-1', description: 'first', category_id: 2, new: true },
]

const models = (result: Array<{ model: string }>) => result.map(product => product.model)

describe('filterProducts', () => {
  it('returns a copy in original order with no filters', () => {
    const all = filterProducts(products, '', 'Todos', false, categories)
    expect(models(all)).toEqual(models(products))
    expect(all).not.toBe(products)
  })

  it('searches model and description case-insensitively', () => {
    expect(models(filterProducts(products, 'LED', 'Todos', false, categories))).toEqual(['SPL-LED-800', 'LED-1'])
    expect(models(filterProducts(products, 'wash', '', false, categories))).toEqual(['SPL-COB-200'])
  })

  it('resolves category names, including duplicates', () => {
    expect(models(filterProducts(products, '', 'Moving Head', false, categories))).toEqual(['SPL-LED-800', 'ab'])
    expect(models(filterProducts(products, '', 'Missing', false, categories))).toEqual([])
    expect(models(filterProducts(
      [
        { model: 'one', description: '', category_id: 1, new: false },
        { model: 'two', description: '', category_id: 2, new: false },
      ],
      '', 'Shared', false,
      [{ id: 1, name: 'Shared' }, { id: 2, name: 'Shared' }],
    ))).toEqual(['one', 'two'])
  })

  it('combines new-only and category filters', () => {
    expect(models(filterProducts(products, '', 'Todos', true, categories))).toEqual(['SPL-LED-800', 'LED-1'])
    expect(models(filterProducts(products, 'led', 'Wash Light', true, categories))).toEqual(['LED-1'])
  })

  it('never matches across the model/description boundary', () => {
    expect(models(filterProducts(products, 'bc', '', false, categories))).toEqual([])
    expect(models(filterProducts(products, 'b\u0000c', '', false, categories))).toEqual([])
  })
})

describe('catalog selectors', () => {
  it('returns only new products up to the limit', () => {
    expect(models(getFeaturedProducts(products, 1))).toEqual(['SPL-LED-800'])
  })

  it('searches without touching the filter rules', () => {
    expect(models(searchProducts(products, 'first'))).toEqual(['LED-1'])
  })

  it('returns related products excluding the current model', () => {
    const related = getProductsByCategoryId(products, 1, 3, 'SPL-LED-800')
    expect(models(related)).toEqual(['ab'])
  })
})
