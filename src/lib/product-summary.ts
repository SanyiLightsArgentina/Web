import type { CatalogProduct, Category } from '@/lib/catalog'

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
  return {
    id: product.id,
    model: product.model,
    description: product.description,
    categoryId: product.category_id,
    categoryLabel: product.category_name
      || categories.find(category => category.id === product.category_id)?.name
      || 'Sin categoría',
    cardImage: images.cardImage,
    thumbImage: images.thumbImage,
    isNew: product.new,
    counts: {
      images: product.images?.length ?? 0,
      contents: product.contents?.length ?? 0,
      videos: product.videos?.length ?? 0,
    },
    href: `/producto/${encodeURIComponent(product.model)}`,
  }
}
