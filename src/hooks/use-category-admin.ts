import { useRef, useState } from 'react'
import type { Category } from '@/lib/catalog'
import { useCatalog } from './use-catalog'
import { useCatalogWrites } from './use-catalog-writes'
import { useSaveSiteSection } from './use-site-settings'

/** Category intent, pending work and retry lifetime stay behind one interface. */
export function useCategoryAdmin() {
  const catalog = useCatalog()
  const writes = useCatalogWrites()
  const reorder = useSaveSiteSection()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)

  const run = async (action: () => Promise<unknown>, complete: () => void) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      await action()
      complete()
    } catch {
      // The admin write session reports the failure; retain the draft/confirmation.
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  const cancelEditing = () => {
    if (inFlight.current) return
    setEditingCategory(null)
    setEditingName('')
  }
  return {
    categories: catalog.categories, isLoaded: catalog.isLoaded, error: catalog.error, retry: catalog.refetch,
    busy, canReorder: catalog.categoryOrderReady, editingCategory, editingName, setEditingName, newCategoryName, setNewCategoryName,
    isAddingCategory, deleteConfirmation,
    startAdding: () => {
      if (inFlight.current) return
      cancelEditing()
      setIsAddingCategory(true)
    },
    cancelAdding: () => {
      if (inFlight.current) return
      setIsAddingCategory(false)
      setNewCategoryName('')
    },
    startEditing: (category: Category) => {
      if (inFlight.current) return
      setIsAddingCategory(false)
      setEditingCategory(category)
      setEditingName(category.name)
    },
    cancelEditing,
    handleAddCategory: async () => {
      const name = newCategoryName.trim()
      if (!name) return
      await run(() => writes.addCategory(name), () => {
        setNewCategoryName('')
        setIsAddingCategory(false)
      })
    },
    handleEditCategory: async () => {
      if (inFlight.current || !editingCategory) return
      const name = editingName.trim()
      if (!name) return
      if (name === editingCategory.name) { cancelEditing(); return }
      await run(() => writes.updateCategory(editingCategory.id, name), () => {
        setEditingCategory(null)
        setEditingName('')
      })
    },
    handleDeleteCategory: (category: Category) => {
      if (!inFlight.current) setDeleteConfirmation(category)
    },
    cancelDeleteCategory: () => { if (!inFlight.current) setDeleteConfirmation(null) },
    confirmDeleteCategory: async () => {
      if (!deleteConfirmation) return
      await run(() => writes.deleteCategory(deleteConfirmation.id, deleteConfirmation.name), () => setDeleteConfirmation(null))
    },
    moveCategory: async (categoryId: number, direction: -1 | 1) => {
      if (!catalog.categoryOrderReady) return
      const index = catalog.categories.findIndex(category => category.id === categoryId)
      const to = index + direction
      if (index < 0 || index >= catalog.categories.length || to < 0 || to >= catalog.categories.length) return
      const ids = catalog.categories.map(category => category.id)
      ;[ids[index], ids[to]] = [ids[to], ids[index]]
      await run(() => reorder.mutateAsync({ key: 'category_order', value: ids }), () => {})
    },
  }
}
