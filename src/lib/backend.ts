import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseCatalogStore, type CatalogReadStore } from './catalog-store'
import { createSupabaseCatalogWrites, type CatalogWriteStore } from './catalog-writes'
import { createSupabaseMediaStore } from './media'
import { createMediaPublication, type MediaPublication } from './media-publication'
import { createSiteSectionStore } from './site-section-store'
import { supabase } from './supabase'
import type { SiteSectionUpdate } from './site-settings'

/**
 * Every adapter the app reads and writes through, chosen once at the
 * composition root (App) and supplied to hooks by BackendProvider. Tests
 * provide in-memory adapters for the parts they exercise.
 */
export interface Backend {
  catalog: CatalogReadStore
  writes: CatalogWriteStore
  siteSections: { save(update: SiteSectionUpdate): Promise<SiteSectionUpdate> }
  media: MediaPublication
}

export function createSupabaseBackend(client: SupabaseClient, storageOrigin: string): Backend {
  const catalog = createSupabaseCatalogStore(client)
  return {
    catalog,
    writes: createSupabaseCatalogWrites(client),
    siteSections: createSiteSectionStore(client),
    media: createMediaPublication(createSupabaseMediaStore(client), storageOrigin, catalog.loadReferencedMediaUrls),
  }
}

let supabaseBackend: Backend | undefined

/** The production Backend: Supabase for data, Storage and references. Created on first use. */
export function getSupabaseBackend(): Backend {
  supabaseBackend ??= createSupabaseBackend(supabase, new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin)
  return supabaseBackend
}
