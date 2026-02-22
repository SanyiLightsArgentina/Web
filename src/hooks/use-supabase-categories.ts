import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { queryKeys, SUPABASE_STALE_TIME_MS, SUPABASE_GC_TIME_MS } from '@/lib/query-keys'
import { fetchCategories as fetchCategoriesFn } from '@/lib/supabase-queries'

export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export const useSupabaseCategories = () => {
  const queryClient = useQueryClient()

  const {
    data: categories = [],
    isLoading,
    refetch: loadCategories,
  } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategoriesFn,
    staleTime: SUPABASE_STALE_TIME_MS,
    gcTime: SUPABASE_GC_TIME_MS,
  })

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
      if (error) throw new Error(`No se pudo agregar la categoría: ${error.message}`)
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      toast.success('Categoría agregada exitosamente')
    },
    onError: (err) => {
      toast.error(`Error agregando categoría: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
      if (error) throw new Error(`No se pudo actualizar la categoría: ${error.message}`)
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (err) => {
      toast.error(`Error actualizando categoría: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw new Error('No se pudo eliminar la categoría')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (err) => {
      toast.error(`Error eliminando categoría: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    },
  })

  const addCategory = async (name: string) => {
    const newCategory = await addMutation.mutateAsync(name)
    return newCategory
  }

  const updateCategory = async (id: number, name: string) => {
    const updated = await updateMutation.mutateAsync({ id, name })
    return updated
  }

  const deleteCategory = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  const getCategoryById = (id: number) => categories.find((cat) => cat.id === id)
  const getCategoryByName = (name: string) => categories.find((cat) => cat.name === name)

  return {
    categories,
    isLoaded: !isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    loadCategories,
  }
}
