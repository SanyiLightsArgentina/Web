import type { Product } from '@/data/products'
import type { ProductDraft } from './catalog-writes'
import {
  createMediaUploadSession, mediaObjectKey, mediaObjectPaths,
  type MediaObject, type MediaStore, type MediaTarget,
} from './media'

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

// Files upload a few at a time: each image decodes once per optimized size, so
// this also bounds how many decoded images are held in memory at once.
const CONCURRENT_FILE_UPLOADS = 2

/** Nothing is saved unless every pending file has uploaded successfully. */
export async function resolveProductMedia(
  media: ProductMedia,
  model: string,
  upload: (file: File, target: MediaTarget) => Promise<string>,
): Promise<Record<keyof ProductMedia, string[]>> {
  const result = { images: [], contents: [], videos: [] } as Record<keyof ProductMedia, string[]>
  const pending: { field: keyof ProductMedia; index: number; file: File }[] = []
  for (const field of productMediaFields) {
    media[field].forEach((item, index) => {
      if (item.type === 'file') pending.push({ field, index, file: item.value })
      else if (item.value) result[field][index] = item.value
      else throw new Error('No se pudo subir el archivo. Volvé a intentar.')
    })
  }

  // Stop starting new uploads after a failure, let in-flight ones settle (so
  // the editor can release them), then report the first failure in draft order.
  const failures: { at: number; error: unknown }[] = []
  let next = 0
  const worker = async () => {
    while (next < pending.length && failures.length === 0) {
      const at = next++
      const { field, index, file } = pending[at]
      try {
        const url = await upload(file, { kind: kinds[field], model })
        if (!url) throw new Error('No se pudo subir el archivo. Volvé a intentar.')
        result[field][index] = url
      } catch (error) {
        failures.push({ at, error })
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENT_FILE_UPLOADS, pending.length) }, worker))
  if (failures.length) throw failures.reduce((first, failure) => failure.at < first.at ? failure : first).error
  return result
}

type PublishedMedia = Pick<Product, 'images' | 'contents' | 'videos'>
export type ProductDetailsDraft = Omit<ProductDraft, keyof PublishedMedia>

export function publishedProductMedia(product?: PublishedMedia): string[] {
  return productMediaFields.flatMap(field => product?.[field] ?? [])
}

export class ProductMediaUploadError extends Error {}

export function createProductMediaPublishing(
  store: MediaStore,
  storageOrigin: string,
  readReferencedUrls: () => Promise<string[]>,
  resize?: Parameters<typeof createMediaUploadSession>[1],
) {
  function managedObjects(urls: readonly string[]) {
    return new Map(urls.flatMap(url => {
      let origin: string
      try { origin = new URL(url).origin } catch { return [] }
      if (origin !== storageOrigin) return []
      return mediaObjectPaths(url)
        .filter(({ bucket, path }) => ['product-images', 'product-content', 'product-videos'].includes(bucket) && path.startsWith('products/'))
        .map(object => [mediaObjectKey(object), object] as const)
    }))
  }

  async function finish(
    before: readonly string[],
    after: readonly string[],
    staged?: Map<string, MediaObject>,
    ambiguousWrite = false,
  ) {
    const retained = new Set(managedObjects(after).keys())
    const retired = Array.from(managedObjects(before)).filter(([key]) => !retained.has(key))
    const references = retired.length || (ambiguousWrite && staged?.size)
      ? await readReferencedUrls().then(urls => managedObjects(urls)).catch(() => null)
      : null
    for (const key of references?.keys() ?? []) retained.add(key)

    // A failed response can follow a successful write. Protect published URLs if
    // we cannot establish what the catalog currently references.
    const removable = new Map(references ? retired : [])
    if (staged && (!ambiguousWrite || references)) {
      for (const [key, object] of staged) removable.set(key, object)
      staged.clear()
    }
    await Promise.allSettled(Array.from(removable)
      .filter(([key]) => !retained.has(key))
      .map(async ([, { bucket, path }]) => store.remove(bucket, path)))
  }

  return {
    start(previous?: Product) {
      const staged = new Map<string, MediaObject>()
      const upload = createMediaUploadSession(store, resize, object => staged.set(mediaObjectKey(object), object))
      let ambiguousWrite = false
      return {
        async publish(details: ProductDetailsDraft, media: ProductMedia, write: (draft: ProductDraft) => Promise<unknown>) {
          let resolved: Awaited<ReturnType<typeof resolveProductMedia>>
          try {
            resolved = await resolveProductMedia(media, details.model, upload)
          } catch (error) {
            throw new ProductMediaUploadError(error instanceof Error ? error.message : 'Volvé a intentar.')
          }

          const draft = { ...details, ...resolved }
          try {
            await write(draft)
          } catch (error) {
            ambiguousWrite = true
            throw error
          }

          await finish(publishedProductMedia(previous), publishedProductMedia(draft), staged, ambiguousWrite)
        },
        discard: () => finish([], [], staged, ambiguousWrite),
      }
    },
    async remove(product: Product, write: () => Promise<unknown>) {
      await write()
      await finish(publishedProductMedia(product), [])
    },
  }
}
