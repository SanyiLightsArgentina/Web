import { useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/data/products'
import { useAdminWrite } from '@/hooks/use-admin-write'
import {
  createSupabaseCatalogWrites,
  type CatalogWriteStore,
  type ProductDraft,
} from '@/lib/catalog-writes'

export type { CatalogWriteStore }

/**
 * Catalog writes read as domain operations. Busy, feedback and invalidation
 * belong to the shared admin write session.
 */
export function useCatalogWrites(store?: CatalogWriteStore) {
  const { run, isSaving, lastSaved } = useAdminWrite()
  const supabaseStore = useMemo(() => createSupabaseCatalogWrites(supabase), [])
  const writes = store ?? supabaseStore

  return {
    isSaving,
    lastSaved,
    addProduct: (product: ProductDraft) =>
      run('product', `Producto "${product.model}" agregado`, () => writes.insertProduct(product)),
    updateProduct: (id: number, updates: Partial<Product>, model?: string) =>
      run(
        'product',
        `Producto "${model ?? id}" actualizado`,
        () => writes.updateProduct(id, updates)
      ),
    deleteProduct: (id: number, model?: string) =>
      run('product', `Producto "${model ?? id}" eliminado`, () => writes.deleteProduct(id)),
    addCategory: (name: string) =>
      run('category', `Categoría "${name}" agregada`, () => writes.insertCategory(name)),
    updateCategory: (id: number, name: string) =>
      run('category', `Categoría "${name}" actualizada`, () => writes.updateCategory(id, name)),
    deleteCategory: (id: number, name?: string) =>
      run('category', `Categoría "${name ?? id}" eliminada`, () => writes.deleteCategory(id)),
  }
}
