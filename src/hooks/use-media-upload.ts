import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { resizeProductImage, type ImageSize } from '@/lib/product-images'
import {
  createSupabaseMediaStore,
  mediaDestination,
  validateMedia,
  type MediaStore,
  type MediaTarget,
} from '@/lib/media'

const IMAGE_SIZES: ImageSize[] = ['thumb', 'card', 'detail']

/**
 * One upload interface for every file the site stores. Callers name what the
 * file belongs to; bucket, path, validation and resizing stay here.
 */
export function useMediaUpload(store?: MediaStore) {
  const supabaseStore = useMemo(() => createSupabaseMediaStore(supabase), [])
  const media = store ?? supabaseStore
  const [isUploading, setIsUploading] = useState(false)

  const upload = async (file: File, target: MediaTarget): Promise<string> => {
    const problem = validateMedia(target, file)
    if (problem) throw new Error(problem)

    setIsUploading(true)
    try {
      const destination = mediaDestination(target, file)

      if (target.kind !== 'product-image') {
        return await media.upload(destination.bucket, destination.path, file, destination.cacheControl)
      }

      const variants = await Promise.all(IMAGE_SIZES.map(size => resizeProductImage(file, size)))
      await media.upload(destination.bucket, destination.path, file, destination.cacheControl)

      let detailUrl = ''
      for (const [index, size] of IMAGE_SIZES.entries()) {
        const variant = new File([variants[index]], `${size}.webp`, { type: 'image/webp' })
        const url = await media.upload(
          destination.bucket,
          `${destination.path}/optimized-v1/${size}.webp`,
          variant,
          destination.cacheControl
        )
        if (size === 'detail') detailUrl = url
      }
      return detailUrl
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    upload,
    remove: (bucket: string, path: string) => media.remove(bucket, path),
  }
}
