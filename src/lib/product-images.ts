import paths from './optimized-image-paths.json'

/**
 * Product images are served only as optimized WebP variants stored next to the
 * uploaded original's path: `<original>/optimized-v1/{thumb|card|detail}.webp`.
 * New uploads store only the variants; legacy uploads also kept the original.
 * Upload, delivery and retirement all read the layout from here.
 */
export type ImageSize = 'thumb' | 'card' | 'detail'

export const PRODUCT_IMAGE_BUCKET = 'product-images'
export const IMAGE_SIZES: readonly ImageSize[] = ['thumb', 'card', 'detail']

const VARIANT_DIRECTORY = 'optimized-v1'
const MAX_PIXELS: Record<ImageSize, number> = { thumb: 128, card: 640, detail: 1600 }
const WEBP_QUALITY: Record<ImageSize, number> = { thumb: 0.82, card: 0.82, detail: 0.88 }
const VARIANT = new RegExp(`^(.+)/${VARIANT_DIRECTORY}/(?:${IMAGE_SIZES.join('|')})\\.webp$`)

export const STATIC_IMAGE_REQUIRED = 'Seleccioná una imagen estática JPG, PNG o WebP.'

/** Storage path of one optimized variant of an original image path. */
export function variantPath(original: string, size: ImageSize): string {
  return `${original}/${VARIANT_DIRECTORY}/${size}.webp`
}

/** The original image path a variant path hangs off, or null for any other path. */
export function originalOfVariant(path: string): string | null {
  return path.match(VARIANT)?.[1] ?? null
}

/** Whether a file can become optimized variants: animated GIFs cannot. */
export function isStaticImage(file: Pick<File, 'type'>): boolean {
  return file.type.startsWith('image/') && file.type !== 'image/gif'
}

const optimizedLegacyPaths = new Set(paths)
const publicPath = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`

// Catalog cards reuse the same sources across renders and navigation. Bound the
// cache so browsing or editing many products cannot retain every URL forever,
// but keep it above a full admin list's card and thumb URLs: a sweep larger
// than a FIFO cache misses on every lookup.
const imageUrlCache = new Map<string, string>()
const MAX_CACHED_IMAGE_URLS = 1024

/** The URL to serve for a stored Product image at one size; other URLs pass through. */
export function productImageUrl(source: string | undefined, size: ImageSize): string {
  if (!source) return ''
  const key = `${size}:${source}`
  const cached = imageUrlCache.get(key)
  if (cached !== undefined) return cached
  const result = resolveProductImageUrl(source, size)
  if (imageUrlCache.size >= MAX_CACHED_IMAGE_URLS) {
    imageUrlCache.delete(imageUrlCache.keys().next().value!)
  }
  imageUrlCache.set(key, result)
  return result
}

/** The Product's first image at one size, or '' when it has none. */
export function primaryProductImage(product: { images?: readonly string[] | null } | undefined, size: ImageSize): string {
  return productImageUrl(product?.images?.[0], size)
}

function resolveProductImageUrl(source: string, size: ImageSize): string {
  try {
    const url = new URL(source)
    if (url.origin !== new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin || !url.pathname.startsWith(publicPath)) return source
    const encodedPath = url.pathname.slice(publicPath.length)
    const path = decodeURIComponent(encodedPath)
    // Work on the encoded path so the URL keeps its original escaping.
    const encodedOriginal = originalOfVariant(path) !== null
      ? originalOfVariant(encodedPath)
      : optimizedLegacyPaths.has(path) ? encodedPath : null
    if (!encodedOriginal) return source
    url.pathname = publicPath + variantPath(encodedOriginal, size)
    return url.href
  } catch {
    return source
  }
}

/** Decode, downscale and re-encode one variant. Runs in the browser (canvas). */
export async function resizeProductImage(file: File, size: ImageSize): Promise<Blob> {
  if (!isStaticImage(file)) throw new Error(STATIC_IMAGE_REQUIRED)
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const scale = Math.min(1, MAX_PIXELS[size] / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo procesar la imagen')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY[size]))
    if (!blob || blob.type !== 'image/webp') throw new Error('Este navegador no permite convertir imágenes a WebP')
    return blob
  } finally {
    bitmap.close()
  }
}
