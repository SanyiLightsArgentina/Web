import type { CatalogProduct, Category } from '@/lib/catalog'
import { productFacts } from '@/lib/product-facts'

export interface ProductImages {
  cardImage: string
  thumbImage: string
}

export interface ProductPresentation {
  id?: number
  model: string
  description: string
  categoryId: number
  categoryLabel: string
  cardImage: string
  thumbImage: string
  isNew: boolean
  counts: { images: number; contents: number; videos: number }
  href: string
}

/**
 * The fields every product surface renders. Cards receive this instead of
 * reading rows, so the category label and counts are resolved once.
 */
export function buildProductPresentation(
  product: CatalogProduct,
  images: ProductImages,
  categories: readonly Category[] = []
): ProductPresentation {
  const facts = productFacts(product, categories)
  return {
    id: product.id,
    model: product.model,
    description: product.description,
    categoryId: product.category_id,
    categoryLabel: facts.categoryLabel,
    cardImage: images.cardImage,
    thumbImage: images.thumbImage,
    isNew: facts.isNew,
    counts: { images: facts.imageCount, contents: facts.contentCount, videos: facts.videoCount },
    href: `/producto/${encodeURIComponent(product.model)}`,
  }
}
