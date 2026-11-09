import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Product } from '@/data/products'
import { useCatalog } from './use-catalog'
import { useCatalogWrites } from './use-catalog-writes'
import { toast } from './use-toast'
import { applyCatalogQuery } from '@/lib/catalog-query'
import { createSupabaseCatalogStore } from '@/lib/catalog-store'
import { summarizeCatalog } from '@/lib/catalog-stats'
import { createSupabaseMediaStore } from '@/lib/media'
import {
  createProductMediaPublishing, ProductMediaUploadError, publishedProductMedia,
  type ProductDetailsDraft, type ProductMedia,
} from '@/lib/product-media'
import { supabase } from '@/lib/supabase'

function useProductAdminState() {
  const catalog = useCatalog()
  const writes = useCatalogWrites()
  const publishing = useMemo(() => {
    const read = createSupabaseCatalogStore(supabase)
    return createProductMediaPublishing(
      createSupabaseMediaStore(supabase),
      new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin,
      async () => {
        const [products, settings] = await Promise.all([read.loadProductMedia(), read.loadSiteSettings()])
        return [
          ...products.flatMap(publishedProductMedia),
          ...settings.hero.map(slide => slide.src),
          ...settings.videos.items.map(video => video.url),
          ...settings.clients.map(client => client.logo),
        ]
      },
    )
  }, [])
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
