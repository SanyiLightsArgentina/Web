import { expect, it } from 'vitest'
import { catalogCriteria, catalogHref, catalogReturnHref, productNavigation } from './catalog-location'

it('distinguishes all products from a category named Todos', () => {
  expect(catalogHref()).toBe('/productos')
  expect(catalogHref('Todos')).toBe('/productos?categoria=Todos')
  expect(catalogCriteria(new URLSearchParams('categoria=Todos')).categoryName).toBe('Todos')
  expect(catalogCriteria(new URLSearchParams()).categoryName).toBe('')
})

it('carries the filtered catalog origin through Product entry and related Products', () => {
  const origin = '/productos?categoria=Moving+Head&q=LED&pagina=2'
  const first = productNavigation({ pathname: '/productos', search: origin.slice('/productos'.length) }, '/producto/Lamp')
  expect(first).toEqual({ to: '/producto/Lamp', state: { catalogUrl: origin } })
  const related = productNavigation({ pathname: first.to, search: '', state: first.state }, '/producto/Other')
  expect(catalogReturnHref({ pathname: related.to, search: '', state: related.state })).toBe(origin)
})

it('falls back to the catalog for direct Product entry or invalid origin state', () => {
  for (const state of [undefined, null, 1, 'invalid', {}, { catalogUrl: 5 }, { catalogUrl: 'https://evil.test' }, { catalogUrl: '//evil.test' }, { catalogUrl: '/productos-otro' }, { catalogUrl: '/admin' }]) {
    expect(catalogReturnHref({ pathname: '/producto/Lamp', search: '', state })).toBe('/productos')
  }
  expect(productNavigation({ pathname: '/', search: '' }, '/producto/Lamp').state).toEqual({ catalogUrl: '/productos' })
})
it('reads filters and accepts only finite positive page numbers', () => {
  expect(catalogCriteria(new URLSearchParams('q=lamp&nuevos=1&pagina=2.9'))).toEqual({ query: 'lamp', categoryName: '', onlyNew: true, page: 2 })
  for (const page of ['Infinity', '-1', '0', 'bad']) expect(catalogCriteria(new URLSearchParams({ pagina: page })).page).toBe(1)
})
