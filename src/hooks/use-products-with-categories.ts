import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/data/products'
import { toast } from 'sonner'

export interface ProductWithCategory extends Product {
  category_name?: string
  categories?: {
    id: number
    name: string
  }
}

export interface Category {
  id: number
  name: string
}

export const useProductsWithCategories = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const loadProductsWithCategories = async () => {
    try {
      setIsLoaded(false)
      
      // Cargar productos y categorías en paralelo
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories:category_id (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
      ])

      if (productsResult.error) {
        toast.error('Error cargando productos desde la base de datos')
        return { products: [], categories: [] }
      }

      if (categoriesResult.error) {
        toast.error('Error cargando categorías desde la base de datos')
        return { products: [], categories: [] }
      }

      // Procesar los productos con información de categoría
      const processedProducts: ProductWithCategory[] = productsResult.data?.map(product => ({
        ...product,
        category_name: product.categories?.name || 'Sin categoría'
      })) || []

      // Usar todas las categorías disponibles, no solo las de los productos
      const categoriesList = categoriesResult.data || []

      return { products: processedProducts, categories: categoriesList }
    } catch (error) {
      console.error('Error cargando productos con categorías:', error)
      toast.error('Error cargando datos')
      return { products: [], categories: [] }
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadProductsWithCategories().then(({ products, categories }) => {
      setProducts(products)
      setCategories(categories)
    }).catch(() => {
      setProducts([])
      setCategories([])
      setIsLoaded(true)
    })
  }, [])

  const addProduct = async (product: Product, files?: {
    image?: File;
    content?: File;
    content2?: File;
    video?: File;
  }) => {
    try {
      setIsSaving(true)
      
      // Excluir campos que no deben enviarse al crear un producto nuevo
      const { id, created_at, updated_at, ...productData } = product
      
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          categories:category_id (
            id,
            name
          )
        `)

      if (error) {
        throw new Error(`No se pudo agregar el producto: ${error.message}`)
      }

      const newProduct = {
        ...data[0],
        category_name: data[0].categories?.name || 'Sin categoría'
      }

      setProducts(prev => [newProduct, ...prev])
      setLastSaved(new Date())
      
      toast.success(`Producto "${productData.model}" agregado exitosamente`)
      return newProduct
    } catch (error) {
      console.error('Error agregando producto:', error)
      toast.error(`Error agregando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      setIsSaving(true)
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories:category_id (
            id,
            name
          )
        `)

      if (error) {
        throw new Error(`No se pudo actualizar el producto: ${error.message}`)
      }

      const updatedProduct = {
        ...data[0],
        category_name: data[0].categories?.name || 'Sin categoría'
      }

      setProducts(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      )
      setLastSaved(new Date())
      
      return updatedProduct
    } catch (error) {
      console.error('Error actualizando producto:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error('No se pudo eliminar el producto')
      }

      setProducts(prev => prev.filter(p => p.id !== id))
      setLastSaved(new Date())
      
    } catch (error) {
      console.error('Error eliminando producto:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const searchProducts = (searchTerm: string, categoryId?: number) => {
    return products.filter(product => {
      const matchesSearch = product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryId || product.category_id === categoryId
      return matchesSearch && matchesCategory
    })
  }

  const getProductByModel = (model: string) => {
    return products.find(p => p.model === model)
  }

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id)
  }

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name === name)
  }

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
    loadProductsWithCategories
  }
}
