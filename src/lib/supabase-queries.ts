import { supabase } from '@/lib/supabase'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los productos')
  return data ?? []
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error('No se pudieron cargar las categorías')
  return data ?? []
}
