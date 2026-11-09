import type { SupabaseClient } from '@supabase/supabase-js'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import type { SiteSettings } from '@/lib/site-settings'
import { createSiteSectionStore } from './site-section-store'

/** Everything the public site reads, behind one adapter seam. */
export interface CatalogReadStore {
  loadProducts(): Promise<Product[]>
  loadCategories(): Promise<Category[]>
  loadSiteSettings(): Promise<SiteSettings>
}

export function createSupabaseCatalogStore(client: SupabaseClient): CatalogReadStore {
  return {
    async loadProducts() {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error('No se pudieron cargar los productos')
      return data ?? []
    },

    async loadCategories() {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw new Error('No se pudieron cargar las categorías')
      return data ?? []
    },

    loadSiteSettings: createSiteSectionStore(client).load,
  }
}
