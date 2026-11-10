import { createSupabaseCatalogStore } from '@/lib/catalog-store'
import { createSupabaseMediaStore } from '@/lib/media'
import { createMediaPublication, type MediaPublication } from '@/lib/media-publication'
import { supabase } from '@/lib/supabase'

let supabasePublication: MediaPublication | undefined

/** The site's media publication, backed by Supabase Storage and the catalog's references. */
export function supabaseMediaPublication(): MediaPublication {
  if (!supabasePublication) {
    const read = createSupabaseCatalogStore(supabase)
    supabasePublication = createMediaPublication(
      createSupabaseMediaStore(supabase),
      new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin,
      read.loadReferencedMediaUrls,
    )
  }
  return supabasePublication
}
