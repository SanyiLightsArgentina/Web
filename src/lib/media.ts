import type { SupabaseClient } from '@supabase/supabase-js'
import { resizeProductImage, type ImageSize } from './product-images'

export type MediaTarget =
  | { kind: 'product-image'; model: string }
  | { kind: 'product-content'; model: string }
  | { kind: 'product-video'; model: string }
  | { kind: 'site-video'; section: 'hero' | 'videos' }
  | { kind: 'client-logo'; clientId: string }

export interface MediaDestination {
  bucket: string
  path: string
  cacheControl: string
}

export type MediaObject = Pick<MediaDestination, 'bucket' | 'path'>

export const mediaObjectKey = ({ bucket, path }: MediaObject): string => `${bucket}/${path}`

export interface MediaStore {
  upload(bucket: string, path: string, file: File, cacheControl: string): Promise<string>
  remove(bucket: string, path: string): Promise<void>
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const VIDEO_NAME = /\.(mp4|webm|mov|m4v|avi)$/i
const MAX_CLIENT_LOGO_BYTES = 10 * 1024 * 1024

export function sanitizePathSegment(value: string, fallback = 'archivo'): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^_+|_+$/g, '')
  return normalized || fallback
}

function extensionOf(file: File, fallback: string): string {
  return file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || fallback
}

function logoExtension(file: File): string {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/jpeg') return 'jpg'
  return 'webp'
}

export function validateMedia(target: MediaTarget, file: File): string | null {
  if (file.size === 0) return 'El archivo está vacío.'
  if (target.kind === 'client-logo') {
    if (!IMAGE_TYPES.includes(file.type)) return 'Usá una imagen PNG, JPG o WebP.'
    if (file.size > MAX_CLIENT_LOGO_BYTES) return 'Usá una imagen de hasta 10 MB.'
    return null
  }
  if (target.kind === 'product-image') {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return 'Seleccioná una imagen estática JPG, PNG o WebP.'
    }
    return null
  }
  if (target.kind === 'product-video' || target.kind === 'site-video') {
    if (!file.type.startsWith('video/') && !VIDEO_NAME.test(file.name)) {
      return 'Seleccioná un archivo de video válido.'
    }
  }
  return null
}

export function mediaDestination(
  target: MediaTarget,
  file: File,
  id: string = crypto.randomUUID()
): MediaDestination {
  const fileName = sanitizePathSegment(file.name)
  switch (target.kind) {
    case 'product-image':
      return {
        bucket: 'product-images',
        path: `products/${sanitizePathSegment(target.model)}/${id}_${fileName}`,
        cacheControl: '31536000',
      }
    case 'product-content':
      return {
        bucket: 'product-content',
        path: `products/${sanitizePathSegment(target.model)}/content/${file.type.startsWith('image/') ? 'images' : 'documents'}/${id}_${fileName}`,
        cacheControl: '3600',
      }
    case 'product-video':
      return {
        bucket: 'product-videos',
        path: `products/${sanitizePathSegment(target.model)}/videos/${id}.${extensionOf(file, 'mp4')}`,
        cacheControl: '3600',
      }
    case 'site-video':
      return {
        bucket: 'product-videos',
        path: `site/${target.section}/${id}.${extensionOf(file, 'mp4')}`,
        cacheControl: '3600',
      }
    case 'client-logo':
      return {
        bucket: 'product-images',
        path: `clients/${sanitizePathSegment(target.clientId)}/${id}.${logoExtension(file)}`,
        cacheControl: '3600',
      }
  }
}

export function contentTypeFor(file: File): string {
  if (file.name.toLowerCase().endsWith('.mp4')) return 'video/mp4'
  return file.type || 'application/octet-stream'
}

const OPTIMIZED_SIZES: ImageSize[] = ['thumb', 'card', 'detail']
const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/'

/**
 * The storage objects behind one public media URL. Product images also own
 * their optimized variants, including the original an optimized URL came from.
 */
export function mediaObjectPaths(url: string): MediaObject[] {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return []
  }
  const markerAt = parsed.pathname.indexOf(PUBLIC_OBJECT_MARKER)
  if (markerAt === -1) return []
  let publicPath: string
  try {
    publicPath = decodeURIComponent(parsed.pathname.slice(markerAt + PUBLIC_OBJECT_MARKER.length))
  } catch {
    return []
  }
  const [bucket, ...segments] = publicPath.split('/')
  if (!bucket || segments.length === 0) return []
  const path = segments.join('/')

  const optimized = path.match(/^(.*)\/optimized-v1\/(?:thumb|card|detail)\.webp$/)
  const original = optimized?.[1] ?? (bucket === 'product-images' && path.startsWith('products/') ? path : null)
  if (!original) return [{ bucket, path }]

  return [
    { bucket, path: original },
    ...OPTIMIZED_SIZES.map(size => ({ bucket, path: `${original}/optimized-v1/${size}.webp` })),
  ]
}

/** Progress belongs to this editor session, never to persisted or published media. */
export function createMediaUploadSession(
  store: MediaStore,
  resize: (file: File, size: ImageSize) => Promise<Blob> = resizeProductImage,
  onAttempt?: (object: MediaObject) => void,
) {
  const files = new WeakMap<File, Map<string, {
    destination: MediaDestination
    completed: Map<string, string>
    pending?: Promise<string>
  }>>()

  return async (file: File, target: MediaTarget): Promise<string> => {
    const problem = validateMedia(target, file)
    if (problem) throw new Error(problem)
    const identity = 'model' in target ? target.model : 'section' in target ? target.section : target.clientId
    const key = `${target.kind}:${identity}`
    let targets = files.get(file)
    if (!targets) { targets = new Map(); files.set(file, targets) }
    let progress = targets.get(key)
    if (!progress) {
      progress = { destination: mediaDestination(target, file), completed: new Map() }
      targets.set(key, progress)
    }
    if (progress.pending) return progress.pending
    const { destination, completed } = progress
    const put = async (path: string, data: File) => {
      const existing = completed.get(path)
      if (existing) return existing
      onAttempt?.({ bucket: destination.bucket, path })
      const url = await store.upload(destination.bucket, path, data, destination.cacheControl)
      if (!url) throw new Error('No se pudo subir el archivo. Volvé a intentar.')
      completed.set(path, url)
      return url
    }
    const run = async () => {
      if (target.kind !== 'product-image') return put(destination.path, file)
      const detailPath = `${destination.path}/optimized-v1/detail.webp`
      if (completed.has(detailPath)) return completed.get(detailPath)!
      const sizes: ImageSize[] = ['thumb', 'card', 'detail']
      // Decode before storing the original, so unsupported images leave no upload behind.
      const variants = await Promise.all(sizes.map(size => resize(file, size)))
      await put(destination.path, file)
      let detailUrl = ''
      for (const [index, size] of sizes.entries()) {
        detailUrl = await put(`${destination.path}/optimized-v1/${size}.webp`, new File([variants[index]], `${size}.webp`, { type: 'image/webp' }))
      }
      return detailUrl
    }
    progress.pending = run()
    try {
      return await progress.pending
    } finally {
      progress.pending = undefined
    }
  }
}

export function createSupabaseMediaStore(client: SupabaseClient): MediaStore {
  return {
    async upload(bucket, path, file, cacheControl) {
      const { error } = await client.storage.from(bucket).upload(path, file, {
        cacheControl,
        contentType: contentTypeFor(file),
        upsert: false,
      })
      if (error) throw new Error(error.message)

      const { data } = client.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    },

    async remove(bucket, path) {
      const { error } = await client.storage.from(bucket).remove([path])
      if (error) throw new Error(error.message)
    },
  }
}
