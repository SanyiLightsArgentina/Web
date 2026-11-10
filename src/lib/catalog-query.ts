import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'

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

// Products come from react-query and the array keeps its identity between
// renders, so the lowercase search text is derived once per catalog snapshot.
const searchTextByProducts = new WeakMap<readonly Product[], { model: string; description: string }[]>()

function searchText(products: readonly Product[]) {
  let texts = searchTextByProducts.get(products)
  if (!texts) {
    texts = products.map(product => ({
      model: product.model.toLowerCase(),
      description: (product.description ?? '').toLowerCase(),
    }))
    searchTextByProducts.set(products, texts)
  }
  return texts
}

/**
 * The Products matching a filter, in catalog order. Text matches the model or
 * the description (never across both), case-insensitively; a category name
 * matches every Category with that name. Returns a new array.
 */
export function applyCatalogQuery<T extends Product>(
  products: readonly T[],
  filter: CatalogFilter = {},
  categories: readonly Category[] = []
): T[] {
  const text = (filter.text ?? '').trim().toLowerCase()
  const categoryName = filter.categoryName ?? ''
  const categoryIds = filter.categoryId != null
    ? new Set([filter.categoryId])
    : categoryName ? new Set(categories.filter(category => category.name === categoryName).map(category => category.id)) : null

  // The unfiltered catalog is the most common state; avoid walking it at all.
  if (!text && !categoryIds && !filter.onlyNew) return products.slice()

  const texts = text ? searchText(products) : null
  return products.filter((product, index) =>
    (!filter.onlyNew || product.new) &&
    (!categoryIds || categoryIds.has(product.category_id)) &&
    (!texts || texts[index].model.includes(text) || texts[index].description.includes(text)))
}

/** The first `limit` Products matching `keep`, in catalog order; stops reading once full. */
function firstMatching<T>(products: readonly T[], limit: number, keep: (product: T) => boolean): T[] {
  const matches: T[] = []
  for (const product of products) {
    if (matches.length >= limit) break
    if (keep(product)) matches.push(product)
  }
  return matches
}

/** New Products in catalog order (newest first), up to `limit`. */
export function newProducts<T extends Product>(products: readonly T[], limit = Infinity): T[] {
  return firstMatching(products, limit, product => product.new === true)
}

/** Other Products in the same Category as `product`, in catalog order, up to `limit`. */
export function relatedProducts<T extends Product>(products: readonly T[], product: Product | undefined, limit: number): T[] {
  if (!product?.category_id) return []
  return firstMatching(products, limit, other => other.category_id === product.category_id && other.model !== product.model)
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
