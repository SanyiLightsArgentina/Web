import type { Product } from '@/data/products'

export const UNCATEGORIZED_LABEL = 'Sin categoría'

export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface CatalogProduct extends Product {
  category_name: string
}

/**
 * Applies the admin-defined order, then falls back to alphabetical for any
 * category that is not in the order list. Does not mutate the query snapshot.
 */
export function orderCategories(
  categories: readonly Category[],
  categoryOrder: readonly number[] = []
): Category[] {
  const position = new Map(categoryOrder.map((id, index) => [id, index]))
  return [...categories].sort((a, b) => {
    const aIndex = position.get(a.id)
    const bIndex = position.get(b.id)
    if (aIndex === undefined && bIndex === undefined) return a.name.localeCompare(b.name)
    if (aIndex === undefined) return 1
    if (bIndex === undefined) return -1
    return aIndex - bIndex
  })
}

export function joinCatalog(
  products: readonly Product[],
  categories: readonly Category[]
): CatalogProduct[] {
  const nameById = new Map(categories.map(category => [category.id, category.name]))
  return products.map(product => ({
    ...product,
    category_name: nameById.get(product.category_id) ?? UNCATEGORIZED_LABEL,
  }))
}

export function findProductByModel(
  products: readonly CatalogProduct[],
  model: string
): CatalogProduct | undefined {
  let decoded = model
  try {
    decoded = decodeURIComponent(model)
  } catch {
    // Keep the raw segment when it is not valid percent-encoding.
  }
  // Router params arrive decoded; Hero routes arrive encoded. Accept either.
  return products.find(product => product.model === model || product.model === decoded)
}
