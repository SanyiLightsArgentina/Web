import { primaryProductImage } from '@/lib/product-images'
import type { CatalogProduct, Category } from '@/lib/catalog'
import { buildProductPresentation, type ProductPresentation } from '@/lib/product-summary'

export type { ProductPresentation } from '@/lib/product-summary'

const NO_CATEGORIES: readonly Category[] = []

// Catalog rows keep their identity for a whole query snapshot, and the admin
// list re-presents every row on each render. Its card and thumb URLs outnumber
// the bounded image URL cache, so remember the presentation per row instead;
// entries are released together with the snapshot.
const presentationByProduct = new WeakMap<CatalogProduct, {
  categories: readonly Category[]
  presentation: ProductPresentation
}>()

export function presentProduct(
  product: CatalogProduct,
  categories: readonly Category[] = NO_CATEGORIES
): ProductPresentation {
  const cached = presentationByProduct.get(product)
  if (cached && cached.categories === categories) return cached.presentation
  const presentation = buildProductPresentation(
    product,
    {
      cardImage: primaryProductImage(product, 'card'),
      thumbImage: primaryProductImage(product, 'thumb'),
    },
    categories
  )
  presentationByProduct.set(product, { categories, presentation })
  return presentation
}
