import { productImageUrl } from '@/lib/product-images'
import type { CatalogProduct, Category } from '@/lib/catalog'
import { buildProductPresentation, type ProductPresentation } from '@/lib/product-summary'

export type { ProductPresentation } from '@/lib/product-summary'

export function presentProduct(
  product: CatalogProduct,
  categories: readonly Category[] = []
): ProductPresentation {
  return buildProductPresentation(
    product,
    {
      cardImage: productImageUrl(product.images?.[0], 'card'),
      thumbImage: productImageUrl(product.images?.[0], 'thumb'),
    },
    categories
  )
}
