import { describe, expect, it } from 'vitest'
import { applyCatalogQuery, modelFromRoute, paginate, parseCatalogQuery, productRoute, updateCatalogQuery } from './catalog-query'

const categories = [{ id: 1, name: 'Moving Head' }, { id: 2, name: 'Laser' }]
const products = [
  { model: 'A', description: 'LED', category_id: 1, new: true, contents: ['https://example.com/manual.pdf'] },
  { model: 'B', description: 'Beam', category_id: 2, new: false },
  { model: 'C', description: 'LED wash', category_id: 1, new: false },
]

describe('parseCatalogQuery', () => {
  it('reads filters and accepts only finite positive page numbers', () => {
    expect(parseCatalogQuery(new URLSearchParams('q=lamp&nuevos=1&pagina=2.9'))).toEqual({ text: 'lamp', categoryName: '', onlyNew: true, page: 2 })
    for (const page of ['Infinity', '-1', '0', 'bad']) expect(parseCatalogQuery(new URLSearchParams({ pagina: page })).page).toBe(1)
  })
})

describe('updateCatalogQuery', () => {
  it('drops the page on a filter change and keeps filters on a page change', () => {
    const filtered = updateCatalogQuery(new URLSearchParams('q=led&pagina=2'), { q: 'wash' })
    expect(filtered.toString()).toBe('q=wash')
    const paged = updateCatalogQuery(new URLSearchParams('q=led&pagina=2'), { pagina: 3 })
    expect(paged.toString()).toBe('q=led&pagina=3')
  })

  it('removes an empty filter and the first page', () => {
    const next = updateCatalogQuery(new URLSearchParams('categoria=Laser&nuevos=1&pagina=2'), { categoria: '', nuevos: false, pagina: 1 })
    expect(next.toString()).toBe('')
  })
})

describe('applyCatalogQuery', () => {
  it('filters by text, category name or id, and new-only status', () => {
    expect(applyCatalogQuery(products, { text: 'led' }).map(product => product.model)).toEqual(['A', 'C'])
    expect(applyCatalogQuery(products, { categoryName: 'Laser' }, categories).map(product => product.model)).toEqual(['B'])
    expect(applyCatalogQuery(products, { categoryId: 1, onlyNew: true }).map(product => product.model)).toEqual(['A'])
  })
})

describe('paginate', () => {
  it('clamps the requested page and reports the window', () => {
    const items = Array.from({ length: 25 }, (_, index) => index)
    expect(paginate(items, 2, 10)).toMatchObject({ page: 2, totalPages: 3, total: 25, start: 10, end: 20 })
    expect(paginate(items, 99, 10)).toMatchObject({ page: 3, start: 20, end: 25 })
    expect(paginate(items, 0, 10).page).toBe(1)
  })
})

describe('Product route', () => {
  it('round-trips models with spaces and slashes', () => {
    for (const model of ['SPL LED/800', 'SPL-LED-800', '100% LED']) {
      expect(modelFromRoute(productRoute(model))).toBe(model)
    }
    expect(modelFromRoute('/productos')).toBeNull()
    expect(modelFromRoute('/producto/')).toBeNull()
  })
})
