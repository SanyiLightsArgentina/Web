import { useCatalog } from './use-catalog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'

export type { Category } from '@/lib/catalog'

export const useSupabaseCategories = () => {
  const queryClient = useQueryClient()
  const { categories, isLoaded } = useCatalog()

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
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
  }
}

