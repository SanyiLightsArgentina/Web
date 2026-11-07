import type { Product } from '@/data/products'
import type { MediaTarget } from './media'

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
