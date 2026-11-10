import type { SupabaseClient } from '@supabase/supabase-js'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import { siteMediaUrls, type SiteSettings } from '@/lib/site-settings'
import { publishedProductMedia } from './product-media'
import { createSiteSectionStore } from './site-section-store'

/** Everything the public site reads, behind one adapter seam. */
export interface CatalogReadStore {
  loadProducts(): Promise<Product[]>
  loadCategories(): Promise<Category[]>
  loadSiteSettings(): Promise<SiteSettings>
}

type ProductMediaRow = Pick<Product, 'images' | 'contents' | 'videos'>

export function createSupabaseCatalogStore(client: SupabaseClient) {
  const loadSiteSettings = createSiteSectionStore(client).load
  async function loadProductMedia(): Promise<ProductMediaRow[]> {
    const { data, count, error } = await client.from('products')
      .select('images, contents, videos', { count: 'exact' })
    // Cleanup needs a complete reference set, even when the catalog read is capped.
    if (error || !data || data.length !== count) {
      throw new Error('No se pudieron verificar los archivos en uso')
    }
    return data
  }

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

    loadSiteSettings,

    loadProductMedia,

    /** Every media URL any Product or Site section references, for safe retirement. */
    async loadReferencedMediaUrls(): Promise<string[]> {
      const [products, settings] = await Promise.all([loadProductMedia(), loadSiteSettings()])
      return [...products.flatMap(publishedProductMedia), ...siteMediaUrls(settings)]
    },
  } satisfies CatalogReadStore & {
    loadProductMedia(): Promise<ProductMediaRow[]>
    loadReferencedMediaUrls(): Promise<string[]>
  }
}
