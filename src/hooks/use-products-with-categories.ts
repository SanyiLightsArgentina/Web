import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Product } from '@/data/products'
import { toast } from 'sonner'
import { queryKeys, SUPABASE_STALE_TIME_MS, SUPABASE_GC_TIME_MS } from '@/lib/query-keys'
import { fetchProducts, fetchCategories } from '@/lib/supabase-queries'
import type { CategoryRow } from '@/lib/supabase-queries'
import type { Category } from '@/hooks/use-supabase-categories'

export interface ProductWithCategory extends Product {
  category_name?: string
  categories?: { id: number; name: string }
}

function joinProductsWithCategories(
  products: Product[],
  categories: Category[] | CategoryRow[]
): ProductWithCategory[] {
  return products.map((p) => ({
    ...p,
    category_name: categories.find((c) => c.id === p.category_id)?.name ?? 'Sin categoría',
  }))
}

export const useProductsWithCategories = () => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const products = useMemo(
    () => joinProductsWithCategories(productsQuery.data ?? [], categoriesQuery.data ?? []),
    [productsQuery.data, categoriesQuery.data]
  )
  const categories = categoriesQuery.data ?? []
  const isLoaded = !productsQuery.isLoading && !categoriesQuery.isLoading

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
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (error) throw new Error(`No se pudo agregar el producto: ${error.message}`)

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
      toast.success(`Producto "${productData.model}" agregado exitosamente`)

      const category = categories.find((c) => c.id === productData.category_id)
      return {
        ...data[0],
        category_name: category?.name ?? 'Sin categoría',
      }
    } catch (error) {
      console.error('Error agregando producto:', error)
      toast.error(
        `Error agregando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`)

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())

      const category = categories.find((c) => c.id === (data[0]?.category_id ?? updates.category_id))
      return {
        ...data[0],
        category_name: category?.name ?? 'Sin categoría',
      }
    } catch (error) {
      console.error('Error actualizando producto:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    setIsSaving(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw new Error('No se pudo eliminar el producto')

      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error eliminando producto:', error)
      throw error
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
