import { expect, it } from 'vitest'
import { catalogHref, catalogReturnHref, productNavigation } from './catalog-location'

it('distinguishes all products from a category named Todos', () => {
  expect(catalogHref()).toBe('/productos')
  expect(catalogHref('Todos')).toBe('/productos?categoria=Todos')
  expect(catalogHref('Moving Head')).toBe('/productos?categoria=Moving+Head')
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
