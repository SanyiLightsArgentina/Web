import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import { productFacts } from '@/lib/product-presentation'

export interface CategoryStat {
  name: string
  count: number
  percentage: number
}

export interface CatalogSummary {
  totalProducts: number
  newProducts: number
  productsWithVideo: number
  productsWithMultipleContents: number
  productsWithMultipleImages: number
  describedProducts: number
  productsWithPrimaryImage: number
  productsWithContent: number
  categoryStats: CategoryStat[]
}

/**
 * The admin overview needs several independent catalog counts. They are
 * collected in one pass over one Product facts value, including the
 * per-category distribution.
 */
export function summarizeCatalog(
  products: readonly Product[],
  categories: readonly Category[]
): CatalogSummary {
  const categoryCounts = new Map<number, number>()
  let newProducts = 0
  let productsWithVideo = 0
  let productsWithMultipleContents = 0
  let productsWithMultipleImages = 0
  let describedProducts = 0
  let productsWithPrimaryImage = 0
  let productsWithContent = 0

  for (let index = 0; index < products.length; index += 1) {
    // Match Array#filter, which skips holes in sparse arrays.
    if (!(index in products)) continue
    const facts = productFacts(products[index])
    if (facts.isNew) newProducts += 1
    if (facts.hasVideo) productsWithVideo += 1
    if (facts.hasMultipleContents) productsWithMultipleContents += 1
    if (facts.hasMultipleImages) productsWithMultipleImages += 1
    if (facts.isDescribed) describedProducts += 1
    if (facts.hasPrimaryImage) productsWithPrimaryImage += 1
    if (facts.hasContent) productsWithContent += 1
    const categoryId = products[index].category_id
    categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1)
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
    productsWithMultipleContents,
    productsWithMultipleImages,
    describedProducts,
    productsWithPrimaryImage,
    productsWithContent,
    categoryStats,
  }
}
