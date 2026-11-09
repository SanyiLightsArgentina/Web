import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { createSupabaseCatalogStore, type CatalogReadStore } from '@/lib/catalog-store'
import { queryKeys, SUPABASE_GC_TIME_MS, SUPABASE_STALE_TIME_MS } from '@/lib/query-keys'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { joinCatalog, orderCategories, type CatalogProduct, type Category } from '@/lib/catalog'

export interface Catalog {
  products: CatalogProduct[]
  categories: Category[]
  isLoaded: boolean
  categoryOrderReady: boolean
  error: Error | null
  refetch: () => void
}

/**
 * The single read interface for the catalog. Screens get products already
 * joined to their category and categories already in the admin-defined order.
 * The store is injectable so tests cross the same seam as production.
 */
export function useCatalog(store?: CatalogReadStore): Catalog {
  const supabaseStore = useMemo(() => createSupabaseCatalogStore(supabase), [])
  const read = store ?? supabaseStore
  const settingsQuery = useSiteSettings(read)
  const { settings } = settingsQuery

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: () => read.loadProducts(),
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => read.loadCategories(),
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const categories = useMemo(
    () => orderCategories(categoriesQuery.data ?? [], settings.category_order),
    [categoriesQuery.data, settings.category_order]
  )

  const products = useMemo(
    () => joinCatalog(productsQuery.data ?? [], categories),
    [productsQuery.data, categories]
  )

  return {
    products,
    categories,
    isLoaded: !productsQuery.isLoading && !categoriesQuery.isLoading,
    categoryOrderReady: categoriesQuery.isSuccess && categoriesQuery.fetchStatus === 'idle'
      && settingsQuery.isSuccess && settingsQuery.fetchStatus === 'idle',
    error: (productsQuery.error ?? categoriesQuery.error ?? settingsQuery.error) as Error | null,
    refetch: () => {
      void productsQuery.refetch()
      void categoriesQuery.refetch()
      void settingsQuery.refetch()
    },
  }
}
