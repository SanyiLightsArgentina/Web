import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCategoryAdmin } from './use-category-admin'

const { writes, reorder } = vi.hoisted(() => ({
  writes: { addCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn() },
  reorder: { mutateAsync: vi.fn() },
}))
const categories = [{ id: 1, name: 'Lights' }, { id: 2, name: 'Effects' }]
vi.mock('./use-catalog', () => ({ useCatalog: () => ({ categories, isLoaded: true, categoryOrderReady: true, error: null, refetch: vi.fn() }) }))
vi.mock('./use-catalog-writes', () => ({ useCatalogWrites: () => writes }))
vi.mock('./use-site-settings', () => ({ useSaveSiteSection: () => reorder }))
beforeEach(() => vi.resetAllMocks())

it('guards duplicate deletion, cancellation and competing ordering synchronously', async () => {
  let finish!: () => void
  writes.deleteCategory.mockImplementation(() => new Promise<void>(resolve => { finish = resolve }))
  const { result } = renderHook(useCategoryAdmin)
  act(() => result.current.handleDeleteCategory(categories[0]))
  let pending!: Promise<void>
  act(() => {
    pending = result.current.confirmDeleteCategory()
    void result.current.confirmDeleteCategory()
    result.current.cancelDeleteCategory()
    void result.current.moveCategory(2, -1)
    result.current.startAdding()
  })
  expect(writes.deleteCategory).toHaveBeenCalledOnce()
  expect(reorder.mutateAsync).not.toHaveBeenCalled()
  expect(result.current.deleteConfirmation).toEqual(categories[0])
  expect(result.current.isAddingCategory).toBe(false)
  await act(async () => { finish(); await pending })
  expect(result.current.deleteConfirmation).toBeNull()
  expect(result.current.busy).toBe(false)
  await act(async () => { await result.current.moveCategory(2, -1) })
  expect(reorder.mutateAsync).toHaveBeenCalledExactlyOnceWith({ key: 'category_order', value: [2, 1] })
})

it('preserves failed creation, guards duplicate submits and clears only on success', async () => {
  writes.addCategory.mockRejectedValueOnce(new Error('offline'))
  const { result } = renderHook(useCategoryAdmin)
  act(() => { result.current.startAdding(); result.current.setNewCategoryName(' Wash ') })
  await act(async () => { await result.current.handleAddCategory() })
  expect(result.current.newCategoryName).toBe(' Wash ')
  expect(result.current.isAddingCategory).toBe(true)
  await act(async () => { await Promise.all([result.current.handleAddCategory(), result.current.handleAddCategory()]) })
  expect(writes.addCategory.mock.calls).toEqual([['Wash'], ['Wash']])
  expect(result.current.isAddingCategory).toBe(false)
  expect(result.current.newCategoryName).toBe('')
})
