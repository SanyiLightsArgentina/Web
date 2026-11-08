import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductAdminProvider, useProductAdmin } from './use-product-admin'

const { writes, catalog, media } = vi.hoisted(() => ({
  writes: { addProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(), isSaving: false, lastSaved: null },
  catalog: { products: [] as Array<Record<string, unknown>>, categories: [], isLoaded: true, error: null, refetch: vi.fn() },
  media: { removeByUrl: vi.fn(async () => undefined) },
}))
vi.mock('./use-catalog', () => ({ useCatalog: () => catalog }))
vi.mock('./use-catalog-writes', () => ({ useCatalogWrites: () => writes }))
vi.mock('./use-media-upload', () => ({ useMediaUpload: () => ({ removeByUrl: media.removeByUrl }) }))
const product = { id: 7, model: 'Lamp', category_id: 1, description: 'Light', new: false }

beforeEach(() => {
  vi.resetAllMocks()
  catalog.products = []
})
describe('product admin', () => {
  it('switches between create and edit and closes only after a successful save', async () => {
    const { result } = renderHook(useProductAdmin, { wrapper: ProductAdminProvider })
    act(() => result.current.onEditProduct(product))
    expect(result.current.editingProduct).toEqual(product)
    writes.updateProduct.mockRejectedValueOnce(new Error('offline'))
    await act(async () => { await expect(result.current.onSaveProduct(product)).rejects.toThrow('offline') })
    expect(result.current.editingProduct).toEqual(product)
    await act(async () => { await result.current.onSaveProduct(product) })
    expect(writes.updateProduct).toHaveBeenCalledWith(7, product, 'Lamp')
    expect(result.current.editingProduct).toBeNull()
    act(() => result.current.onAddProduct())
    expect(result.current.isAddingProduct).toBe(true)
    await act(async () => { await result.current.onSaveProduct(product) })
    expect(writes.addProduct).toHaveBeenCalledWith(product)
    expect(result.current.isAddingProduct).toBe(false)
  })
  it('keeps failed deletion available for retry and cancels without writing', async () => {
    const { result } = renderHook(useProductAdmin, { wrapper: ProductAdminProvider })
    act(() => result.current.onDeleteProduct(product))
    writes.deleteProduct.mockRejectedValueOnce(new Error('offline'))
    await act(async () => { await result.current.confirmDeleteProduct() })
    expect(result.current.deleteProductConfirmation).toEqual(product)
    await act(async () => { await result.current.confirmDeleteProduct() })
    expect(result.current.deleteProductConfirmation).toBeNull()
    act(() => { result.current.onDeleteProduct(product); result.current.cancelDeleteProduct() })
    expect(writes.deleteProduct).toHaveBeenCalledTimes(2)
  })

  it('collects media removed by an edit without touching shared URLs', async () => {
    const edited = { ...product, images: ['a', 'b', 'c'], contents: [], videos: [] }
    const other = { ...product, id: 8, model: 'Other', images: ['b'], contents: [], videos: [] }
    catalog.products = [edited, other]
    const { result } = renderHook(useProductAdmin, { wrapper: ProductAdminProvider })
    act(() => result.current.onEditProduct(edited))
    await act(async () => { await result.current.onSaveProduct({ ...edited, images: ['a'] }) })
    expect(media.removeByUrl).toHaveBeenCalledExactlyOnceWith('c')
  })

  it('collects a deleted Product media without touching shared URLs', async () => {
    const deleted = { ...product, images: ['a', 'b'], contents: [], videos: [] }
    const other = { ...product, id: 8, model: 'Other', images: ['b'], contents: [], videos: [] }
    catalog.products = [deleted, other]
    const { result } = renderHook(useProductAdmin, { wrapper: ProductAdminProvider })
    act(() => result.current.onDeleteProduct(deleted))
    await act(async () => { await result.current.confirmDeleteProduct() })
    expect(media.removeByUrl).toHaveBeenCalledWith('a')
    expect(media.removeByUrl).not.toHaveBeenCalledWith('b')
  })
})
