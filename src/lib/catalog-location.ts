/** Category absence means all products; display labels are never sentinels. */
export function catalogHref(categoryName: string | null = null): string {
  return categoryName === null ? '/productos' : `/productos?${new URLSearchParams({ categoria: categoryName })}`
}

export function catalogCriteria(params: URLSearchParams) {
  const page = Number(params.get('pagina'))
  return {
    query: params.get('q') ?? '', categoryName: params.get('categoria') ?? '',
    onlyNew: params.get('nuevos') === '1',
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  }
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
