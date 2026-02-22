import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Product } from '@/data/products'

export interface CategoryRow {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    toast.error('Error cargando productos desde la base de datos')
    return []
  }
  return data ?? []
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    toast.error('Error cargando categorías desde la base de datos')
    return []
  }
  return data ?? []
}
