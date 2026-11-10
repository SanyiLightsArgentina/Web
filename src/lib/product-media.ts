import type { Product } from '@/data/products'
import type { ProductDraft } from './catalog-writes'
import type { MediaTarget } from './media'
import type { MediaPublication } from './media-publication'

export type MediaItem = { type: 'url'; value: string } | { type: 'file'; value: File }
export type ProductMedia = Record<'images' | 'contents' | 'videos', MediaItem[]>
export const productMediaFields = ['images', 'contents', 'videos'] as const
const kinds = { images: 'product-image', contents: 'product-content', videos: 'product-video' } as const

export function productMedia(product?: Product): ProductMedia {
  return {
    images: (product?.images ?? []).map(value => ({ type: 'url', value })),
    contents: (product?.contents ?? []).map(value => ({ type: 'url', value })),
    videos: (product?.videos ?? []).map(value => ({ type: 'url', value })),
  }
}

/** Nothing is saved unless every pending file has uploaded successfully. */
export async function resolveProductMedia(
  media: ProductMedia,
  model: string,
  upload: (file: File, target: MediaTarget) => Promise<string>,
): Promise<Record<keyof ProductMedia, string[]>> {
  const result = { images: [], contents: [], videos: [] } as Record<keyof ProductMedia, string[]>
  for (const field of productMediaFields) {
    for (const item of media[field]) {
      const url = item.type === 'url' ? item.value : await upload(item.value, { kind: kinds[field], model })
      if (!url) throw new Error('No se pudo subir el archivo. Volvé a intentar.')
      result[field].push(url)
    }
  }
  return result
}

type PublishedMedia = Pick<Product, 'images' | 'contents' | 'videos'>
export type ProductDetailsDraft = Omit<ProductDraft, keyof PublishedMedia>

export function publishedProductMedia(product?: PublishedMedia): string[] {
  return productMediaFields.flatMap(field => product?.[field] ?? [])
}

export class ProductMediaUploadError extends Error {}

/** Product media publication: resolves the draft's files, then publishes them with the Product write. */
export function createProductMediaPublishing(publication: MediaPublication) {
  return {
    start(previous?: Product) {
      const session = publication.start()
      return {
        async publish(details: ProductDetailsDraft, media: ProductMedia, write: (draft: ProductDraft) => Promise<unknown>) {
          let resolved: Awaited<ReturnType<typeof resolveProductMedia>>
          try {
            resolved = await resolveProductMedia(media, details.model, session.upload)
          } catch (error) {
            throw new ProductMediaUploadError(error instanceof Error ? error.message : 'Volvé a intentar.')
          }
          const draft = { ...details, ...resolved }
          await session.publish(publishedProductMedia(previous), async () => {
            await write(draft)
            return publishedProductMedia(draft)
          })
        },
        discard: session.discard,
      }
    },
    remove: (product: Product, write: () => Promise<unknown>) =>
      publication.remove(publishedProductMedia(product), write),
  }
}
