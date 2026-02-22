import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Product } from '@/data/products'
import { toast } from 'sonner'
import { useSupabaseStorage } from './use-supabase-storage'
import { queryKeys, SUPABASE_STALE_TIME_MS, SUPABASE_GC_TIME_MS } from '@/lib/query-keys'
import { fetchProducts } from '@/lib/supabase-queries'

export const useSupabaseProducts = () => {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { uploadProductImage, uploadProductContent, uploadProductVideo } = useSupabaseStorage()

  const {
    data: products = [],
    isLoading,
    refetch: loadProducts,
  } = useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const addMutation = useMutation({
    mutationFn: async ({
      product,
      files,
    }: {
      product: Product
      files?: { image?: File; content?: File; content2?: File; video?: File }
    }) => {
      const finalProduct = { ...product }
      if (files?.image) {
        const imageUrl = await uploadProductImage(files.image, product.model)
        if (imageUrl) finalProduct.images = [...(finalProduct.images || []), imageUrl]
      }
      if (files?.content) {
        const contentUrl = await uploadProductContent(files.content, product.model)
        if (contentUrl) finalProduct.contents = [...(finalProduct.contents || []), contentUrl]
      }
      if (files?.content2) {
        const content2Url = await uploadProductContent(files.content2, product.model)
        if (content2Url) finalProduct.contents = [...(finalProduct.contents || []), content2Url]
      }
      if (files?.video) {
        const videoUrl = await uploadProductVideo(files.video, product.model)
        if (videoUrl) finalProduct.videos = [...(finalProduct.videos || []), videoUrl]
      }
      const { data, error } = await supabase
        .from('products')
        .insert([finalProduct])
        .select()
      if (error) throw new Error(`No se pudo agregar el producto: ${error.message}`)
      return data[0]
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
      toast.success(`Producto "${variables.product.model}" agregado exitosamente`)
    },
    onError: (err) => {
      toast.error(`Error agregando producto: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Product> }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`)
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (model: string) => {
      const { error } = await supabase.from('products').delete().eq('model', model)
      if (error) throw new Error('No se pudo eliminar el producto')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      setLastSaved(new Date())
      toast.success('Producto eliminado exitosamente')
    },
  })

  const addProduct = async (
    product: Product,
    files?: { image?: File; content?: File; content2?: File; video?: File }
  ) => {
    setIsSaving(true)
    try {
      const result = await addMutation.mutateAsync({ product, files })
      return result
    } finally {
      setIsSaving(false)
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({ id, updates })
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (model: string) => {
    setIsSaving(true)
    try {
      await deleteMutation.mutateAsync(model)
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

  return {
    products,
    isLoaded: !isLoading,
    isSaving,
    lastSaved,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductByModel,
    loadProducts,
  }
}
