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

describe('getFeaturedProducts', () => {
  // fetchProducts returns the catalog newest first, so new products are grouped
  // at the front rather than spread across the snapshot.
  const catalog = Array.from({ length: 80 }, (_, index) => ({
    model: `LED-${index}`, description: '', category_id: index % 4 + 1, new: index < 12,
  }))

  it('returns the first requested new products in catalog order, preserving identity', () => {
    const snapshot = [...catalog]
    const result = getFeaturedProducts(catalog, 3)
    expect(models(result)).toEqual(['LED-0', 'LED-1', 'LED-2'])
    result.forEach((product, index) => expect(product).toBe(catalog[index]))
    expect(catalog).toEqual(snapshot)
  })

  it('stops inspecting products as soon as the requested count is reached', () => {
    const input = [...catalog]
    Object.defineProperty(input, 20, { get() { throw new Error('Unneeded product inspected') } })
    expect(models(getFeaturedProducts(input, 3))).toEqual(['LED-0', 'LED-1', 'LED-2'])
  })

  it.each([0, 1, 3, 6, 100, -1, -3, 1.9, NaN, Infinity, -Infinity])(
    'preserves filter/slice results for limit %s', count => {
      expect(getFeaturedProducts(catalog, count)).toEqual(
        catalog.filter(product => product.new === true).slice(0, count),
      )
    },
  )

  it('uses six new products by default and handles empty or fully old catalogs', () => {
    expect(getFeaturedProducts(catalog)).toEqual(catalog.slice(0, 6))
    expect(getFeaturedProducts([])).toEqual([])
    expect(getFeaturedProducts(catalog.map(product => ({ ...product, new: false })))).toEqual([])
  })

  it('skips holes in sparse catalogs like Array#filter did', () => {
    const sparse = [...catalog]
    delete sparse[1]
    delete sparse[4]
    for (const count of [0, 1, 6, 8, -1, 1.9]) {
      expect(getFeaturedProducts(sparse, count)).toEqual(
        sparse.filter(product => product.new === true).slice(0, count),
      )
    }
  })
})

describe('getProductsByCategoryId', () => {
  const catalog = Array.from({ length: 80 }, (_, index) => ({
    model: `LED-${index}`, description: '', category_id: index % 4 + 1, new: false,
  }))

  it('returns the first three eligible products by default, preserving identity and order', () => {
    const snapshot = [...catalog]
    const result = getProductsByCategoryId(catalog, 1, undefined, 'LED-0')
    expect(models(result)).toEqual(['LED-4', 'LED-8', 'LED-12'])
    result.forEach((product, index) => expect(product).toBe(catalog[(index + 1) * 4]))
    expect(catalog).toEqual(snapshot)
    expect(getProductsByCategoryId(catalog, 1)).not.toBe(getProductsByCategoryId(catalog, 1))
  })

  it('stops inspecting products as soon as the requested count is reached', () => {
    const input = [...catalog]
    Object.defineProperty(input, 9, { get() { throw new Error('Unneeded product inspected') } })
    expect(models(getProductsByCategoryId(input, 1))).toEqual(['LED-0', 'LED-4', 'LED-8'])
  })

  it.each([0, 1, 3, 100, -1, -3, 1.9, NaN, Infinity, -Infinity])(
    'preserves filter/slice results for limit %s', count => {
      for (const category of [0, 1, 4, 99]) {
        for (const exclude of [undefined, 'LED-0']) {
          const expected = catalog.filter(p => p.category_id === category && p.model !== exclude).slice(0, count)
          expect(getProductsByCategoryId(catalog, category, count, exclude)).toEqual(expected)
        }
      }
    },
  )

  it('handles empty and sparse catalogs and excludes every duplicate of the current model', () => {
    expect(getProductsByCategoryId([], 1)).toEqual([])
    expect(getProductsByCategoryId(catalog, 0)).toEqual([])
    const sparse = [...catalog]
    delete sparse[0]
    expect(getProductsByCategoryId(sparse, 1)).toEqual([catalog[4], catalog[8], catalog[12]])
    expect(getProductsByCategoryId([catalog[0], catalog[0], catalog[4]], 1, 3, 'LED-0'))
      .toEqual([catalog[4]])
  })
})
