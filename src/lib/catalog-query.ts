import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import { selectProducts } from '@/lib/product-utils'

/** The catalog query as the page understands it, independent of URL spelling. */
export interface CatalogQuery {
  text: string
  categoryName: string
  onlyNew: boolean
  page: number
}

export interface CatalogFilter {
  text?: string
  categoryName?: string
  categoryId?: number | null
  onlyNew?: boolean
}

export type CatalogQueryPatch = Partial<{
  q: string
  categoria: string
  nuevos: boolean
  pagina: number
}>

const PER_PAGE = 20

export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  const page = Number(params.get('pagina'))
  return {
    text: params.get('q') ?? '',
    categoryName: params.get('categoria') ?? '',
    onlyNew: params.get('nuevos') === '1',
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  }
}

/**
 * Applies one filter transition. Any filter change drops the page number so
 * the next render starts at page 1; a page change keeps the filters.
 */
export function updateCatalogQuery(params: URLSearchParams, patch: CatalogQueryPatch): URLSearchParams {
  const next = new URLSearchParams(params)
  if (patch.q !== undefined) setOrDelete(next, 'q', patch.q)
  if (patch.categoria !== undefined) setOrDelete(next, 'categoria', patch.categoria)
  if (patch.nuevos !== undefined) {
    if (patch.nuevos) next.set('nuevos', '1')
    else next.delete('nuevos')
  }
  if (patch.pagina !== undefined) {
    if (patch.pagina > 1) next.set('pagina', String(Math.floor(patch.pagina)))
    else next.delete('pagina')
  } else if (patch.q !== undefined || patch.categoria !== undefined || patch.nuevos !== undefined) {
    next.delete('pagina')
  }
  return next
}

function setOrDelete(params: URLSearchParams, key: string, value: string): void {
  if (value) params.set(key, value)
  else params.delete(key)
}

export function applyCatalogQuery<T extends Product>(
  products: T[],
  filter: CatalogFilter = {},
  categories: Category[] = []
): T[] {
  return selectProducts(products, {
    query: filter.text,
    categoryName: filter.categoryName,
    categoryId: filter.categoryId,
    onlyNew: filter.onlyNew,
  }, categories)
}

export interface Page<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
  start: number
  end: number
}

/** One clamp for every caller; the page number never leaves the valid range. */
export function paginate<T>(items: readonly T[], requestedPage: number, perPage = PER_PAGE): Page<T> {
  const total = items.length
  const size = Math.max(1, Math.floor(perPage) || PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(total / size))
  const page = Math.min(Math.max(1, Math.floor(requestedPage) || 1), totalPages)
  const start = (page - 1) * size
  return {
    items: items.slice(start, start + size),
    page,
    totalPages,
    total,
    start,
    end: Math.min(start + size, total),
  }
}

export function productRoute(model: string): string {
  return `/producto/${encodeURIComponent(model)}`
}

export function modelFromRoute(route: string): string | null {
  const prefix = '/producto/'
  if (!route.startsWith(prefix)) return null
  const encoded = route.slice(prefix.length).split(/[?#]/)[0]
  if (!encoded) return null
  try {
    return decodeURIComponent(encoded)
  } catch {
    return encoded
  }
}
