import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CatalogWriteError } from '@/lib/catalog-writes'
import { ProductForm } from './product-form'

const store = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn() }))
vi.mock('@/lib/media', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/media')>(),
  createSupabaseMediaStore: () => store,
}))
beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL() { return 'blob:preview' }
    static revokeObjectURL() {}
  })
  store.upload.mockImplementation(async (_bucket: string, path: string) => `https://example.com/${path}`)
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('reuses uploaded Product media when catalog saving fails in the open form', async () => {
  const onSubmit = vi.fn().mockRejectedValueOnce(new CatalogWriteError('offline')).mockResolvedValueOnce(undefined)
  render(<ProductForm categories={[{ id: 1, name: 'Lights' }]} onSubmit={onSubmit} onCancel={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Modelo *'), { target: { value: 'Lamp' } })
  fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Light' } })
  fireEvent.change(screen.getByLabelText('Subir contenidos'), { target: { files: [new File(['pdf'], 'manual.pdf')] } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear Producto' }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Crear Producto' })).toBeEnabled())
  fireEvent.click(screen.getByRole('button', { name: 'Crear Producto' }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
  expect(store.upload).toHaveBeenCalledTimes(1)
  expect(onSubmit.mock.calls[1][0]).toEqual(onSubmit.mock.calls[0][0])
})
