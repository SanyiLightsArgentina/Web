import { updateCatalogQuery } from './catalog-query'

/** Category absence means all products; display labels are never sentinels. */
export function catalogHref(categoryName: string | null = null): string {
  const query = updateCatalogQuery(new URLSearchParams(), { categoria: categoryName ?? '' }).toString()
  return query ? `/productos?${query}` : '/productos'
}

type CatalogLocation = { pathname: string; search: string; state?: unknown }

/** Return context survives every Product entry point, but never points outside the catalog. */
export function catalogReturnHref(location: CatalogLocation): string {
  if (location.pathname === '/productos') return location.pathname + location.search
  const state = location.state
  const origin = state && typeof state === 'object' && 'catalogUrl' in state ? state.catalogUrl : null
  return typeof origin === 'string' && /^\/productos(?:\?[^#]*)?$/.test(origin) ? origin : catalogHref()
}

export function productNavigation(location: CatalogLocation, href: string) {
  return { to: href, state: { catalogUrl: catalogReturnHref(location) } }
}
