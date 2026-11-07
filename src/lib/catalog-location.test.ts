import { expect, it } from 'vitest'
import { catalogCriteria, catalogHref } from './catalog-location'

it('distinguishes all products from a category named Todos', () => {
  expect(catalogHref()).toBe('/productos')
  expect(catalogHref('Todos')).toBe('/productos?categoria=Todos')
  expect(catalogCriteria(new URLSearchParams('categoria=Todos')).categoryName).toBe('Todos')
  expect(catalogCriteria(new URLSearchParams()).categoryName).toBe('')
})
it('reads filters and accepts only finite positive page numbers', () => {
  expect(catalogCriteria(new URLSearchParams('q=lamp&nuevos=1&pagina=2.9'))).toEqual({ query: 'lamp', categoryName: '', onlyNew: true, page: 2 })
  for (const page of ['Infinity', '-1', '0', 'bad']) expect(catalogCriteria(new URLSearchParams({ pagina: page })).page).toBe(1)
})
