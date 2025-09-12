import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/data/products'
import { toast } from 'sonner'
import { useSupabaseStorage } from './use-supabase-storage'

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { uploadProductImage, uploadProductContent, uploadProductVideo } = useSupabaseStorage()

  const loadProducts = async () => {
    try {
      setIsLoaded(false)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error cargando productos desde la base de datos')
        return []
      }

      return data
    } catch (error) {
      console.error('Error cargando productos:', error)
      return []
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadProducts().then(setProducts).catch(() => {
      setProducts([]);
      setIsLoaded(true);
    });
  }, [])


  const addProduct = async (product: Product, files?: {
    image?: File;
    content?: File;
    content2?: File;
    video?: File;
  }) => {
    try {
      const finalProduct = { ...product };
      
      if (files) {
        if (files.image) {
          const imageUrl = await uploadProductImage(files.image, product.model);
          if (imageUrl) {
            finalProduct.images = [...(finalProduct.images || []), imageUrl];
          }
        }
        
        if (files.content) {
          const contentUrl = await uploadProductContent(files.content, product.model);
          if (contentUrl) {
            finalProduct.contents = [...(finalProduct.contents || []), contentUrl];
          }
        }
        
        if (files.content2) {
          const content2Url = await uploadProductContent(files.content2, product.model);
          if (content2Url) {
            finalProduct.contents = [...(finalProduct.contents || []), content2Url];
          }
        }
        
        if (files.video) {
          const videoUrl = await uploadProductVideo(files.video, product.model);
          if (videoUrl) {
            finalProduct.videos = [...(finalProduct.videos || []), videoUrl];
          }
        }
      }

      console.log('🔍 Intentando agregar producto:', finalProduct)
      
      const { data, error } = await supabase
        .from('products')
        .insert([finalProduct])
        .select()

      if (error) {
        console.error('❌ Error agregando producto:', error)
        console.error('❌ Código de error:', error.code)
        console.error('❌ Mensaje:', error.message)
        console.error('❌ Detalles:', error.details)
        throw new Error(`No se pudo agregar el producto: ${error.message}`)
      }

      console.log('✅ Producto agregado exitosamente:', data)

      const newProducts = [...products, finalProduct]
      setProducts(newProducts)
      setLastSaved(new Date())
      
      toast.success(`Producto "${finalProduct.model}" agregado exitosamente`)
      return finalProduct
    } catch (error) {
      console.error('Error agregando producto:', error)
      toast.error(`Error agregando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      throw error
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      console.log('🔍 Intentando actualizar producto:', { id, updates })
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ Error actualizando producto:', error)
        console.error('❌ Código de error:', error.code)
        console.error('❌ Mensaje:', error.message)
        console.error('❌ Detalles:', error.details)
        throw new Error(`No se pudo actualizar el producto: ${error.message}`)
      }

      console.log('✅ Producto actualizado exitosamente:', data)

      const updatedProducts = products.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
      setProducts(updatedProducts)
      setLastSaved(new Date())
      
      console.log('✅ Producto actualizado exitosamente:', id)
    } catch (error) {
      console.error('Error actualizando producto:', error)
      throw error
    }
  }

  // Eliminar producto
  const deleteProduct = async (model: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('model', model)

      if (error) {
        console.error('Error eliminando producto:', error)
        throw new Error('No se pudo eliminar el producto')
      }

      const updatedProducts = products.filter(p => p.model !== model)
      setProducts(updatedProducts)
      setLastSaved(new Date())
      
      console.log('✅ Producto eliminado exitosamente:', model)
    } catch (error) {
      console.error('Error eliminando producto:', error)
      throw error
    }
  }

  // Buscar productos
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

  return {
    products,
    isLoaded,
    isSaving,
    lastSaved,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductByModel,
    loadProducts
  }
}
