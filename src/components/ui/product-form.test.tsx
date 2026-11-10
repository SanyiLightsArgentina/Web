import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ProductAdminProvider, useProductAdmin } from '@/hooks/use-product-admin'
import { CatalogWriteError } from '@/lib/catalog-writes'
import { defaultSettings } from '@/lib/site-settings'
import { ProductForm } from './product-form'

const { store, writes } = vi.hoisted(() => ({
  store: { upload: vi.fn(), remove: vi.fn() },
  writes: { addProduct: vi.fn(), isSaving: false, lastSaved: null },
}))
vi.mock('@/lib/media', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/media')>(),
  createSupabaseMediaStore: () => store,
}))
vi.mock('@/hooks/use-catalog', () => ({
  useCatalog: () => ({ products: [], categories: [{ id: 1, name: 'Lights' }], isLoaded: true }),
}))
vi.mock('@/hooks/use-catalog-writes', () => ({ useCatalogWrites: () => writes }))
vi.mock('@/lib/catalog-store', () => ({
  createSupabaseCatalogStore: () => ({
    loadProductMedia: async () => [],
    loadSiteSettings: async () => defaultSettings,
    loadReferencedMediaUrls: async () => [],
  }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL() { return 'blob:preview' }
    static revokeObjectURL() {}
  })
  const origin = new URL(import.meta.env.VITE_PUBLIC_SUPABASE_URL).origin
  store.upload.mockImplementation(async (bucket: string, path: string) =>
    `${origin}/storage/v1/object/public/${bucket}/${path}`)
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

function Editor() {
  const admin = useProductAdmin()
  return admin.isAddingProduct
    ? <ProductForm categories={admin.categories} onSubmit={admin.onSaveProduct} onCancel={admin.onCancelForm} loading={admin.isSaving} />
    : <button onClick={admin.onAddProduct}>Agregar</button>
}

async function submitProductWithFile() {
  render(<ProductAdminProvider><Editor /></ProductAdminProvider>)
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
  fireEvent.change(screen.getByLabelText('Modelo *'), { target: { value: 'Lamp' } })
  fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Light' } })
  fireEvent.change(screen.getByLabelText('Subir contenidos'), { target: { files: [new File(['pdf'], 'manual.pdf')] } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear Producto' }))
  await waitFor(() => expect(writes.addProduct).toHaveBeenCalledOnce())
  await waitFor(() => expect(screen.getByRole('button', { name: 'Crear Producto' })).toBeEnabled())
}

it('reuses uploaded Product media when catalog saving fails in the open form', async () => {
  writes.addProduct.mockRejectedValueOnce(new CatalogWriteError('offline')).mockResolvedValueOnce(undefined)
  await submitProductWithFile()

  fireEvent.click(screen.getByRole('button', { name: 'Crear Producto' }))
  await screen.findByRole('button', { name: 'Agregar' })
  expect(writes.addProduct).toHaveBeenCalledTimes(2)
  expect(store.upload).toHaveBeenCalledOnce()
  expect(writes.addProduct.mock.calls[1][0]).toEqual(writes.addProduct.mock.calls[0][0])
  expect(store.remove).not.toHaveBeenCalled()
})

it('releases the draft upload when the editor cancels after a rejected save', async () => {
  writes.addProduct.mockRejectedValueOnce(new CatalogWriteError('offline'))
  await submitProductWithFile()

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  await screen.findByRole('button', { name: 'Agregar' })
  await waitFor(() => expect(store.remove).toHaveBeenCalledExactlyOnceWith(
    'product-content', expect.stringMatching(/manual\.pdf$/),
  ))
})
