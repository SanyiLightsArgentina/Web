import { describe, expect, it } from 'vitest'
import { categoryLabel, findProductByModel, joinCatalog, orderCategories } from './catalog'

const categories = [
  { id: 1, name: 'Wash Light' },
  { id: 2, name: 'Moving Head' },
  { id: 3, name: 'Laser' },
]

describe('orderCategories', () => {
  it('applies the configured order and keeps the rest alphabetical', () => {
    expect(orderCategories(categories, [3, 1]).map(category => category.name))
      .toEqual(['Laser', 'Wash Light', 'Moving Head'])
    expect(orderCategories(categories).map(category => category.name))
      .toEqual(['Laser', 'Moving Head', 'Wash Light'])
  })

  it('does not mutate the query snapshot', () => {
    const snapshot = [...categories]
    orderCategories(categories, [3, 1])
    expect(categories).toEqual(snapshot)
  })
})

describe('joinCatalog', () => {
  const joined = joinCatalog(
    [
      { model: 'A', description: '', category_id: 2, new: false },
      { model: 'B', description: '', category_id: 99, new: false },
    ],
    categories,
  )

  it('resolves the label with a safe fallback', () => {
    expect(joined[0].category_name).toBe('Moving Head')
    expect(joined[1].category_name).toBe('Sin categoría')
    expect(categoryLabel(categories, 3)).toBe('Laser')
    expect(categoryLabel(categories, undefined)).toBe('Sin categoría')
  })

  it('decodes route segments and keeps malformed ones intact', () => {
    expect(findProductByModel(joined, 'A')?.model).toBe('A')
    expect(findProductByModel(joined, 'SPL%2DLED%2D800')).toBeUndefined()
    expect(findProductByModel(joined, '%E0%A4%A')).toBeUndefined()

    const encoded = joinCatalog(
      [{ model: 'SPL LED 800', description: '', category_id: 1, new: false }],
      categories,
    )
    expect(findProductByModel(encoded, encodeURIComponent('SPL LED 800'))?.model).toBe('SPL LED 800')
  })
})
