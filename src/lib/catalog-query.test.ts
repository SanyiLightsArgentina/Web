import { describe, expect, it } from 'vitest'
import { applyCatalogQuery, modelFromRoute, newProducts, paginate, parseCatalogQuery, productRoute, relatedProducts, updateCatalogQuery } from './catalog-query'

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

describe('applyCatalogQuery: text search', () => {
  const catalog = [
    { model: 'SPL-LED-800', description: 'LED moving head', category_id: 1, new: true },
    { model: 'SPL-COB-200', description: 'Wash light cob', category_id: 2, new: false },
    { model: 'ab', description: 'cd', category_id: 1, new: false },
    { model: 'LED-1', description: 'first', category_id: 2, new: true },
  ]
  const models = (result: Array<{ model: string }>) => result.map(product => product.model)

  it('returns a copy of the catalog when nothing filters', () => {
    const all = applyCatalogQuery(catalog)
    expect(all).toEqual(catalog)
    expect(all).not.toBe(catalog)
  })
  it('searches model and description case-insensitively and trims the query', () => {
    expect(models(applyCatalogQuery(catalog, { text: ' LED ' }))).toEqual(['SPL-LED-800', 'LED-1'])
    expect(models(applyCatalogQuery(catalog, { text: 'wash' }))).toEqual(['SPL-COB-200'])
  })
  it('never matches across the model and description', () => {
    for (const text of ['bc', 'b\u0000c', 'ab cd']) expect(applyCatalogQuery(catalog, { text })).toEqual([])
  })
  it('treats category names literally and matches every Category with that name', () => {
    expect(applyCatalogQuery(catalog, { categoryName: 'Todos' }, categories)).toEqual([])
    expect(models(applyCatalogQuery(catalog, { categoryName: 'Shared' }, categories.map(c => ({ ...c, name: 'Shared' }))))).toEqual(models(catalog))
  })
  it('combines search, category and new-only, and reuses the snapshot as it grows', () => {
    expect(models(applyCatalogQuery(catalog, { text: 'led', categoryId: 1, onlyNew: true }))).toEqual(['SPL-LED-800'])
    const next = [...catalog, { model: 'LED-2', description: '', category_id: 1, new: true }]
    expect(models(applyCatalogQuery(next, { text: 'led', categoryId: 1 }))).toEqual(['SPL-LED-800', 'LED-2'])
  })
})

describe('newProducts and relatedProducts', () => {
  const catalog = Array.from({ length: 40 }, (_, index) => ({
    model: `LED-${index}`, description: '', category_id: index % 4 + 1, new: index < 12,
  }))
  const models = (result: Array<{ model: string }>) => result.map(product => product.model)

  it('lists new Products in catalog order, all by default, preserving identity', () => {
    expect(newProducts(catalog)).toHaveLength(12)
    expect(models(newProducts(catalog, 3))).toEqual(['LED-0', 'LED-1', 'LED-2'])
    expect(newProducts(catalog, 3)[0]).toBe(catalog[0])
    expect(newProducts(catalog, 0)).toEqual([])
  })
  it('stops reading the catalog once the limit is reached', () => {
    const input = [...catalog]
    Object.defineProperty(input, 20, { get() { throw new Error('Unneeded product inspected') } })
    expect(models(newProducts(input, 3))).toEqual(['LED-0', 'LED-1', 'LED-2'])
  })
  it('relates Products by Category, excluding the Product itself', () => {
    expect(models(relatedProducts(catalog, catalog[0], 3))).toEqual(['LED-4', 'LED-8', 'LED-12'])
    expect(models(relatedProducts([catalog[0], catalog[0], catalog[4]], catalog[0], 3))).toEqual(['LED-4'])
    expect(relatedProducts(catalog, undefined, 3)).toEqual([])
    expect(relatedProducts(catalog, { ...catalog[0], category_id: 0 }, 3)).toEqual([])
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
