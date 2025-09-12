import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export const useSupabaseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadCategories = async () => {
    try {
      setIsLoaded(false)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        toast.error('Error cargando categorías desde la base de datos')
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error cargando categorías:', error)
      return []
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadCategories().then(setCategories).catch(() => {
      setCategories([])
      setIsLoaded(true)
    })
  }, [])

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()

      if (error) {
        throw new Error(`No se pudo agregar la categoría: ${error.message}`)
      }

      const newCategory = data[0]
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success(`Categoría "${name}" agregada exitosamente`)
      return newCategory
    } catch (error) {
      console.error('Error agregando categoría:', error)
      toast.error(`Error agregando categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      throw error
    }
  }

  const updateCategory = async (id: number, name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`No se pudo actualizar la categoría: ${error.message}`)
      }

      const updatedCategory = data[0]
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
        .sort((a, b) => a.name.localeCompare(b.name))
      )
      toast.success(`Categoría actualizada exitosamente`)
      return updatedCategory
    } catch (error) {
      console.error('Error actualizando categoría:', error)
      toast.error(`Error actualizando categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      throw error
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error('No se pudo eliminar la categoría')
      }

      setCategories(prev => prev.filter(cat => cat.id !== id))
      toast.success('Categoría eliminada exitosamente')
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      toast.error(`Error eliminando categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      throw error
    }
  }

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id)
  }

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name === name)
  }

  return {
    categories,
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    loadCategories
  }
}
