import type { SupabaseClient } from '@supabase/supabase-js'

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
