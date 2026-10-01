import paths from './optimized-image-paths.json'

const optimizedPaths = new Set(paths)
const publicPath = '/storage/v1/object/public/product-images/'
export type ImageSize = 'thumb' | 'card' | 'detail'

export function productImageUrl(source: string | undefined, size: ImageSize): string {
  if (!source) return ''
  try {
    const url = new URL(source)
    if (url.origin !== new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin || !url.pathname.startsWith(publicPath)) return source
    const path = decodeURIComponent(url.pathname.slice(publicPath.length))
    if (path.endsWith('/optimized-v1/detail.webp')) {
      url.pathname = url.pathname.replace(/detail\.webp$/, `${size}.webp`)
    } else if (optimizedPaths.has(path)) {
      url.pathname += `/optimized-v1/${size}.webp`
    } else return source
    return url.href
  } catch {
    return source
  }
}

export async function resizeProductImage(file: File, size: ImageSize): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') throw new Error('Seleccioná una imagen estática JPG, PNG o WebP')
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const limit = { thumb: 128, card: 640, detail: 1600 }[size]
    const scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo procesar la imagen')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', size === 'detail' ? 0.88 : 0.82))
    if (!blob || blob.type !== 'image/webp') throw new Error('Este navegador no permite convertir imágenes a WebP')
    return blob
  } finally {
    bitmap.close()
  }
}
