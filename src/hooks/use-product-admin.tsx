import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'
import { useCatalog } from './use-catalog'
import { useCatalogWrites } from './use-catalog-writes'
import { toast } from './use-toast'
import { selectProducts } from '@/lib/product-utils'
import { summarizeCatalog } from '@/lib/catalog-stats'

function useProductAdminState() {
  const catalog = useCatalog()
  const writes = useCatalogWrites()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [searchTerm, onSearchChange] = useState('')
  const [selectedCategoryId, onCategoryChange] = useState<number | null>(null)
  const [deleteProductConfirmation, onDeleteProduct] = useState<Product | null>(null)
  const deleteInProgress = useRef(false)
  const onCancelForm = () => { setEditingProduct(null); setIsAddingProduct(false) }
  const visibleProducts = useMemo(
    () => selectProducts(catalog.products, { query: searchTerm, categoryId: selectedCategoryId }),
    [catalog.products, searchTerm, selectedCategoryId]
  )
  const summary = useMemo(
    () => summarizeCatalog(catalog.products, catalog.categories),
    [catalog.products, catalog.categories]
  )

  return {
    categories: catalog.categories, summary, visibleProducts, loading: !catalog.isLoaded,
    error: catalog.error?.message ?? null, onRetry: catalog.refetch,
    isSaving: writes.isSaving, lastSaved: writes.lastSaved,
    editingProduct, isAddingProduct, searchTerm, selectedCategoryId,
    onSearchChange, onCategoryChange, onCancelForm, onDeleteProduct, deleteProductConfirmation,
    onAddProduct: () => { setEditingProduct(null); setIsAddingProduct(true) },
    onEditProduct: (product: Product) => { setIsAddingProduct(false); setEditingProduct(product) },
    onSaveProduct: async (draft: Omit<Product, 'created_at' | 'updated_at'>) => {
      if (editingProduct?.id) await writes.updateProduct(editingProduct.id, draft, draft.model)
      else await writes.addProduct(draft)
      onCancelForm()
    },
    cancelDeleteProduct: () => { if (!deleteInProgress.current) onDeleteProduct(null) },
    confirmDeleteProduct: async () => {
      if (!deleteProductConfirmation || deleteInProgress.current) return
      if (!deleteProductConfirmation.id) {
        toast({ title: 'Error', description: 'No se puede eliminar el producto: ID no encontrado', variant: 'destructive' })
        return
      }
      deleteInProgress.current = true
      try {
        await writes.deleteProduct(deleteProductConfirmation.id, deleteProductConfirmation.model)
        onDeleteProduct(null)
      } catch {
        // The write session reports failure; keep confirmation available for retry.
      } finally {
        deleteInProgress.current = false
      }
    },
  }
}

const ProductAdminContext = createContext<ReturnType<typeof useProductAdminState> | null>(null)

export function ProductAdminProvider({ children }: { children: ReactNode }) {
  const value = useProductAdminState()
  return <ProductAdminContext.Provider value={value}>{children}</ProductAdminContext.Provider>
}

export function useProductAdmin() {
  const value = useContext(ProductAdminContext)
  if (!value) throw new Error('ProductAdminProvider is required')
  return value
}
