import type { SupabaseClient } from '@supabase/supabase-js'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'

export interface ProductDraft extends Omit<Product, 'created_at' | 'updated_at'> {
  id?: number
}

export interface CatalogWriteStore {
  insertProduct(input: ProductDraft): Promise<Product>
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>
  deleteProduct(id: number): Promise<void>
  insertCategory(name: string): Promise<Category>
  updateCategory(id: number, name: string): Promise<Category>
  deleteCategory(id: number): Promise<void>
}

export class CatalogWriteError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CatalogWriteError'
  }
}

/** The row body never carries identity or server-managed timestamps. */
export function productWritePayload(input: ProductDraft): Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  const { id: _id, ...payload } = input as ProductDraft & { created_at?: string; updated_at?: string }
  const { created_at: _createdAt, updated_at: _updatedAt, ...row } = payload
  return row
}

export function createSupabaseCatalogWrites(client: SupabaseClient): CatalogWriteStore {
  return {
    async insertProduct(input) {
      const { data, error } = await client
        .from('products')
        .insert([productWritePayload(input)])
        .select()

      if (error) throw new CatalogWriteError(`No se pudo agregar el producto: ${error.message}`)
      return data?.[0] as Product
    },

    async updateProduct(id, updates) {
      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...payload } = updates
      const { data, error } = await client
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()

      if (error) throw new CatalogWriteError(`No se pudo actualizar el producto: ${error.message}`)
      return data?.[0] as Product
    },

    async deleteProduct(id) {
      const { error } = await client.from('products').delete().eq('id', id)
      if (error) throw new CatalogWriteError('No se pudo eliminar el producto')
    },

    async insertCategory(name) {
      const { data, error } = await client
        .from('categories')
        .insert([{ name }])
        .select()

      if (error) throw new CatalogWriteError(`No se pudo agregar la categoría: ${error.message}`)
      return data?.[0] as Category
    },

    async updateCategory(id, name) {
      const { data, error } = await client
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()

      if (error) throw new CatalogWriteError(`No se pudo actualizar la categoría: ${error.message}`)
      return data?.[0] as Category
    },

    async deleteCategory(id) {
      const { error } = await client.from('categories').delete().eq('id', id)
      if (error) throw new CatalogWriteError('No se pudo eliminar la categoría')
    },
  }
}
