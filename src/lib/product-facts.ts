import type { Product } from '@/data/products'
import { UNCATEGORIZED_LABEL, type Category } from '@/lib/catalog'

/** The facts every product surface needs, derived once from a Product row. */
export interface ProductFacts {
  categoryLabel: string
  isNew: boolean
  imageCount: number
  contentCount: number
  videoCount: number
  hasPrimaryImage: boolean
  hasMultipleImages: boolean
  hasMultipleContents: boolean
  hasVideo: boolean
  hasContent: boolean
  isDescribed: boolean
}

type ProductRow = Product & { category_name?: string }

export function productFacts(product: ProductRow, categories: readonly Category[] = []): ProductFacts {
  const imageCount = product.images?.length ?? 0
  const contentCount = product.contents?.length ?? 0
  const videoCount = product.videos?.length ?? 0

  return {
    categoryLabel:
      product.category_name
      || categories.find(category => category.id === product.category_id)?.name
      || UNCATEGORIZED_LABEL,
    isNew: product.new,
    imageCount,
    contentCount,
    videoCount,
    hasPrimaryImage: imageCount > 0,
    hasMultipleImages: imageCount > 1,
    hasMultipleContents: contentCount > 1,
    hasVideo: videoCount > 0,
    hasContent: contentCount > 0,
    isDescribed: Boolean(product.description),
  }
}
