import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  createMediaUploadSession,
  createSupabaseMediaStore,
  type MediaStore,
  type MediaTarget,
} from '@/lib/media'

/**
 * One upload interface for every file the site stores. Callers name what the
 * file belongs to; bucket, path, validation and resizing stay here.
 */
export function useMediaUpload(store?: MediaStore) {
  const supabaseStore = useMemo(() => createSupabaseMediaStore(supabase), [])
  const media = store ?? supabaseStore
  const uploadMedia = useMemo(() => createMediaUploadSession(media), [media])
  const [pending, setPending] = useState(0)

  const upload = async (file: File, target: MediaTarget): Promise<string> => {
    setPending(count => count + 1)
    try {
      return await uploadMedia(file, target)
    } finally {
      setPending(count => count - 1)
    }
  }

  return {
    isUploading: pending > 0,
    upload,
  }
}
