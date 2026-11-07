import { describe, expect, it } from 'vitest'
import { selectProducts, getFeaturedProducts, getProductsByCategoryId } from './product-utils'

const categories = [{ id: 1, name: 'Moving Head' }, { id: 2, name: 'Wash Light' }]
const products = [
  { model: 'SPL-LED-800', description: 'LED moving head', category_id: 1, new: true, contents: ['https://example.com/manual.pdf'] },
  { model: 'SPL-COB-200', description: 'Wash light cob', category_id: 2, new: false, contents: ['not-a-url'] },
  { model: 'ab', description: 'cd', category_id: 1, new: false },
  { model: 'LED-1', description: 'first', category_id: 2, new: true },
]
const models = (result: Array<{ model: string }>) => result.map(product => product.model)

describe('selectProducts', () => {
  it('returns a copy in catalog order', () => {
    const all = selectProducts(products)
    expect(models(all)).toEqual(models(products))
    expect(all).not.toBe(products)
  })
  it('searches both fields case-insensitively and trims the query', () => {
    expect(models(selectProducts(products, { query: ' LED ' }))).toEqual(['SPL-LED-800', 'LED-1'])
    expect(models(selectProducts(products, { query: 'wash' }))).toEqual(['SPL-COB-200'])
  })
  it('resolves category names and ids without treating names as sentinels', () => {
    expect(models(selectProducts(products, { categoryName: 'Moving Head' }, categories))).toEqual(['SPL-LED-800', 'ab'])
    expect(selectProducts(products, { categoryName: 'Missing' }, categories)).toEqual([])
    expect(selectProducts(products, { categoryName: 'Todos' }, categories)).toEqual([])
    expect(models(selectProducts(products, { categoryName: 'Shared' }, categories.map(c => ({ ...c, name: 'Shared' }))))).toEqual(models(products))
    expect(models(selectProducts(products, { categoryId: 2 }))).toEqual(['SPL-COB-200', 'LED-1'])
  })
  it('combines search, category, new-only and downloadable file selection', () => {
    expect(models(selectProducts(products, { query: 'led', categoryId: 1, onlyNew: true, withFiles: true }))).toEqual(['SPL-LED-800'])
    expect(models(selectProducts(products, { withFiles: true }))).toEqual(['SPL-LED-800'])
    expect(selectProducts(products, { query: 'cob', withFiles: true })).toEqual([])
  })
  it('never matches across model/description fields', () => {
    for (const query of ['bc', 'b\u0000c', 'ab cd']) expect(selectProducts(products, { query })).toEqual([])
  })
  it('returns new products up to the limit', () => {
    expect(models(getFeaturedProducts(products, 1))).toEqual(['SPL-LED-800'])
  })
  it('keeps related products stable and excludes the current model', () => {
    expect(models(getProductsByCategoryId(products, 2, 2))).toEqual(['SPL-COB-200', 'LED-1'])
    expect(models(getProductsByCategoryId(products, 2, 2))).toEqual(['SPL-COB-200', 'LED-1'])
    expect(models(getProductsByCategoryId(products, 1, 3, 'SPL-LED-800'))).toEqual(['ab'])
  })
})
