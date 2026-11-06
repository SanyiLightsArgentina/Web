import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import type { Product } from '@/data/products'
import {
  createSupabaseCatalogWrites,
  type CatalogWriteStore,
  type ProductDraft,
} from '@/lib/catalog-writes'

export type { CatalogWriteStore }

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido'
}

/**
 * One write interface for the catalog. It owns the store call, cache
 * invalidation, the saving state and the single user-facing notification.
 */
export function useCatalogWrites(store?: CatalogWriteStore) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const supabaseStore = useMemo(() => createSupabaseCatalogWrites(supabase), [])
  const writes = store ?? supabaseStore
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const invalidateCatalog = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.products }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
      queryClient.invalidateQueries({ queryKey: queryKeys.siteSettings }),
    ])
  }

  const run = async <T,>(action: () => Promise<T>, successMessage: string): Promise<T> => {
    setIsSaving(true)
    try {
      const result = await action()
      await invalidateCatalog()
      setLastSaved(new Date())
      toast({ title: successMessage })
      return result
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: messageOf(error),
      })
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    lastSaved,
    addProduct: (product: ProductDraft) =>
      run(() => writes.insertProduct(product), `Producto "${product.model}" agregado`),
    updateProduct: (id: number, updates: Partial<Product>, model?: string) =>
      run(
        () => writes.updateProduct(id, updates),
        `Producto "${model ?? id}" actualizado`
      ),
    deleteProduct: (id: number, model?: string) =>
      run(() => writes.deleteProduct(id), `Producto "${model ?? id}" eliminado`),
    addCategory: (name: string) =>
      run(() => writes.insertCategory(name), `Categoría "${name}" agregada`),
    updateCategory: (id: number, name: string) =>
      run(() => writes.updateCategory(id, name), `Categoría "${name}" actualizada`),
    deleteCategory: (id: number, name?: string) =>
      run(() => writes.deleteCategory(id), `Categoría "${name ?? id}" eliminada`),
  }
}
