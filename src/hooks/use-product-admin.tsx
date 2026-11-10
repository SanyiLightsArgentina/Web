import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'
import { useCatalog } from './use-catalog'
import { useCatalogWrites } from './use-catalog-writes'
import { useBackend } from './use-backend'
import { toast } from './use-toast'
import { applyCatalogQuery } from '@/lib/catalog-query'
import { summarizeCatalog } from '@/lib/catalog-stats'
import {
  createProductMediaPublishing, ProductMediaUploadError,
  type ProductDetailsDraft, type ProductMedia,
} from '@/lib/product-media'

function useProductAdminState() {
  const catalog = useCatalog()
  const writes = useCatalogWrites()
  const { media } = useBackend()
  const publishing = useMemo(() => createProductMediaPublishing(media), [media])
  type Editor = { product?: Product; session: ReturnType<typeof publishing.start> }
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const publishInProgress = useRef(false)
  const [searchTerm, onSearchChange] = useState('')
  const [selectedCategoryId, onCategoryChange] = useState<number | null>(null)
  const [deleteProductConfirmation, onDeleteProduct] = useState<Product | null>(null)
  const deleteInProgress = useRef(false)

  const openEditor = (product?: Product) => {
    if (publishInProgress.current || deleteInProgress.current || (editor && editor.product === product)) return
    void editor?.session.discard()
    setEditor({ product, session: publishing.start(product) })
  }
  const onCancelForm = () => {
    if (publishInProgress.current) return
    setEditor(null)
    void editor?.session.discard()
  }
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
    isSaving: writes.isSaving || isPublishing, lastSaved: writes.lastSaved,
    editingProduct: editor?.product ?? null, isAddingProduct: editor !== null && !editor.product,
    searchTerm, selectedCategoryId,
    onSearchChange, onCategoryChange, onCancelForm, onDeleteProduct, deleteProductConfirmation,
    onAddProduct: () => openEditor(),
    onEditProduct: openEditor,
    onSaveProduct: async (details: ProductDetailsDraft, media: ProductMedia) => {
      if (!editor || publishInProgress.current || deleteInProgress.current) return
      publishInProgress.current = true
      setIsPublishing(true)
      try {
        const editingId = editor.product?.id
        await editor.session.publish(details, media, draft => editingId
          ? writes.updateProduct(editingId, draft, draft.model)
          : writes.addProduct(draft))
        setEditor(null)
      } catch (error) {
        if (error instanceof ProductMediaUploadError) {
          toast({ title: 'No se pudo subir el archivo', description: error.message, variant: 'destructive' })
        }
        throw error
      } finally {
        publishInProgress.current = false
        setIsPublishing(false)
      }
    },
    cancelDeleteProduct: () => { if (!deleteInProgress.current) onDeleteProduct(null) },
    confirmDeleteProduct: async () => {
      if (!deleteProductConfirmation || deleteInProgress.current || publishInProgress.current) return
      const deleted = deleteProductConfirmation
      const id = deleted.id
      if (!id) {
        toast({ title: 'Error', description: 'No se puede eliminar el producto: ID no encontrado', variant: 'destructive' })
        return
      }
      deleteInProgress.current = true
      try {
        await publishing.remove(deleted, () => writes.deleteProduct(id, deleted.model))
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
