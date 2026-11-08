import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'
import { useCatalog } from './use-catalog'
import { useCatalogWrites } from './use-catalog-writes'
import { useMediaUpload } from './use-media-upload'
import { toast } from './use-toast'
import { applyCatalogQuery } from '@/lib/catalog-query'
import { summarizeCatalog } from '@/lib/catalog-stats'
import { mediaUrlsUsedBy, productMedia, productMediaUrls, removedProductMediaUrls } from '@/lib/product-media'

function useProductAdminState() {
  const catalog = useCatalog()
  const writes = useCatalogWrites()
  const { removeByUrl } = useMediaUpload()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [searchTerm, onSearchChange] = useState('')
  const [selectedCategoryId, onCategoryChange] = useState<number | null>(null)
  const [deleteProductConfirmation, onDeleteProduct] = useState<Product | null>(null)
  const deleteInProgress = useRef(false)
  const onCancelForm = () => { setEditingProduct(null); setIsAddingProduct(false) }
  const visibleProducts = useMemo(
    () => applyCatalogQuery(catalog.products, { text: searchTerm, categoryId: selectedCategoryId }),
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
      const previous = editingProduct ? productMedia(editingProduct) : null
      const editingId = editingProduct?.id
      if (editingId) await writes.updateProduct(editingId, draft, draft.model)
      else await writes.addProduct(draft)
      if (previous) {
        const usedElsewhere = mediaUrlsUsedBy(catalog.products, editingId)
        const next = {
          images: (draft.images ?? []).map(value => ({ type: 'url' as const, value })),
          contents: (draft.contents ?? []).map(value => ({ type: 'url' as const, value })),
          videos: (draft.videos ?? []).map(value => ({ type: 'url' as const, value })),
        }
        const removed = removedProductMediaUrls(previous, next).filter(url => !usedElsewhere.has(url))
        // Cleanup is best effort: the row was saved and must not be rolled back.
        await Promise.allSettled(removed.map(url => removeByUrl(url)))
      }
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
        const deleted = deleteProductConfirmation
        await writes.deleteProduct(deleted.id, deleted.model)
        const usedElsewhere = mediaUrlsUsedBy(catalog.products, deleted.id)
        const removed = productMediaUrls(productMedia(deleted)).filter(url => !usedElsewhere.has(url))
        await Promise.allSettled(removed.map(url => removeByUrl(url)))
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
