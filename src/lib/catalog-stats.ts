import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'

export interface CategoryStat {
  name: string
  count: number
  percentage: number
}

export interface CatalogSummary {
  totalProducts: number
  newProducts: number
  productsWithVideo: number
  productsWithSecondaryImage: number
  productsWithMultipleImages: number
  describedProducts: number
  productsWithPrimaryImage: number
  productsWithContent: number
  categoryStats: CategoryStat[]
}

/**
 * The admin overview needs several independent catalog counts. They are
 * collected in one pass, including the per-category distribution, instead of
 * rescanning every product once per metric and twice per category.
 */
export function summarizeCatalog(
  products: readonly Product[],
  categories: readonly Category[]
): CatalogSummary {
  const categoryCounts = new Map<number, number>()
  let newProducts = 0
  let productsWithVideo = 0
  let productsWithSecondaryImage = 0
  let productsWithMultipleImages = 0
  let describedProducts = 0
  let productsWithPrimaryImage = 0
  let productsWithContent = 0

  for (let index = 0; index < products.length; index += 1) {
    // Match Array#filter, which skips holes in sparse arrays.
    if (!(index in products)) continue
    const product = products[index]
    if (product.new) newProducts += 1
    if (product.videos && product.videos.length > 0) productsWithVideo += 1
    if (product.contents && product.contents.length > 1) productsWithSecondaryImage += 1
    if ((product.images?.length ?? 0) > 1) productsWithMultipleImages += 1
    if (product.description) describedProducts += 1
    if (product.images && product.images.length > 0) productsWithPrimaryImage += 1
    if (product.contents && product.contents.length > 0) productsWithContent += 1
    categoryCounts.set(product.category_id, (categoryCounts.get(product.category_id) ?? 0) + 1)
  }

  const totalProducts = products.length
  const categoryStats = categories.map(category => {
    const count = categoryCounts.get(category.id) ?? 0
    return {
      name: category.name,
      count,
      percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0,
    }
  })

  return {
    totalProducts,
    newProducts,
    productsWithVideo,
    productsWithSecondaryImage,
    productsWithMultipleImages,
    describedProducts,
    productsWithPrimaryImage,
    productsWithContent,
    categoryStats,
  }
}
