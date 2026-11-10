import type { Product } from '@/data/products'
import { UNCATEGORIZED_LABEL, type CatalogProduct } from '@/lib/catalog'
import { productRoute } from '@/lib/catalog-query'
import { productImageUrl } from '@/lib/product-images'

/** Counts and flags derived from a Product row; the admin overview tallies these. */
export interface ProductFacts {
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

/** The fields every Product surface renders. Cards receive this instead of rows. */
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

export function productFacts(product: Product): ProductFacts {
  const imageCount = product.images?.length ?? 0
  const contentCount = product.contents?.length ?? 0
  const videoCount = product.videos?.length ?? 0
  return {
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

// Catalog rows keep their identity for a whole query snapshot (the Category
// join produces new rows when Categories change), and the admin list
// re-presents every row on each render. Its card and thumb URLs outnumber the
// bounded image URL cache, so remember the presentation per row instead;
// entries are released together with the snapshot.
const presentationByProduct = new WeakMap<CatalogProduct, ProductPresentation>()

/** Present a joined catalog row: Category label, served image URLs, counts and route. */
export function presentProduct(product: CatalogProduct): ProductPresentation {
  const cached = presentationByProduct.get(product)
  if (cached) return cached
  const facts = productFacts(product)
  const presentation: ProductPresentation = {
    id: product.id,
    model: product.model,
    description: product.description,
    categoryId: product.category_id,
    categoryLabel: product.category_name || UNCATEGORIZED_LABEL,
    cardImage: productImageUrl(product.images?.[0], 'card'),
    thumbImage: productImageUrl(product.images?.[0], 'thumb'),
    isNew: facts.isNew,
    counts: { images: facts.imageCount, contents: facts.contentCount, videos: facts.videoCount },
    href: productRoute(product.model),
  }
  presentationByProduct.set(product, presentation)
  return presentation
}
