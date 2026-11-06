import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Product } from '@/data/products'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { CatalogProduct } from '@/lib/catalog'
import { useCatalog } from './use-catalog'

export type ProductWithCategory = CatalogProduct

/**
 * Temporary write surface kept for the admin until catalog writes move behind
 * their own seam. Reads come from the shared catalog module.
 */
export const useProductsWithCategories = () => {
  const queryClient = useQueryClient()
  const { products, categories, isLoaded, error } = useCatalog()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const loadProductsWithCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products })
    queryClient.invalidateQueries({ queryKey: queryKeys.categories })
  }

  const addProduct = async (
    product: Product,
    _files?: { image?: File; content?: File; content2?: File; video?: File }
  ) => {
    setIsSaving(true)
    try {
      const { id, created_at, updated_at, ...productData } = product
      const { data, error: writeError } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (writeError) throw new Error(`No se pudo agregar el producto: ${writeError.message}`)

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
      toast.success(`Producto "${productData.model}" agregado exitosamente`)

      const category = categories.find((c) => c.id === productData.category_id)
      return {
        ...data[0],
        category_name: category?.name ?? 'Sin categoría',
      }
    } catch (writeError) {
      console.error('Error agregando producto:', writeError)
      toast.error(
        `Error agregando producto: ${writeError instanceof Error ? writeError.message : 'Error desconocido'}`
      )
      throw writeError
    } finally {
      setIsSaving(false)
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setIsSaving(true)
    try {
      const { data, error: writeError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (writeError) throw new Error(`No se pudo actualizar el producto: ${writeError.message}`)

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())

      const category = categories.find((c) => c.id === (data[0]?.category_id ?? updates.category_id))
      return {
        ...data[0],
        category_name: category?.name ?? 'Sin categoría',
      }
    } catch (writeError) {
      console.error('Error actualizando producto:', writeError)
      throw writeError
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    setIsSaving(true)
    try {
      const { error: writeError } = await supabase.from('products').delete().eq('id', id)
      if (writeError) throw new Error('No se pudo eliminar el producto')

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
    } catch (writeError) {
      console.error('Error eliminando producto:', writeError)
      throw writeError
    } finally {
      setIsSaving(false)
    }
  }

  const searchProducts = (searchTerm: string, categoryId?: number) => {
    return products.filter((product) => {
      const matchesSearch =
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryId || product.category_id === categoryId
      return matchesSearch && matchesCategory
    })
  }

  const getProductByModel = (model: string) => products.find((p) => p.model === model)
  const getCategoryById = (id: number) => categories.find((cat) => cat.id === id)
  const getCategoryByName = (name: string) => categories.find((cat) => cat.name === name)

  return {
    products,
    categories,
    isLoaded,
    error,
    isSaving,
    lastSaved,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductByModel,
    getCategoryById,
    getCategoryByName,
    loadProductsWithCategories,
  }
}
