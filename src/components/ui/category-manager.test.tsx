import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryManager } from './category-manager'

const { catalog, writes, reorder } = vi.hoisted(() => ({
  catalog: { categories: [{ id: 1, name: 'Lights' }, { id: 2, name: 'Effects' }], isLoaded: true, error: null as Error | null, refetch: vi.fn() },
  writes: { addCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn() },
  reorder: { mutateAsync: vi.fn() },
}))
vi.mock('@/hooks/use-catalog', () => ({ useCatalog: () => catalog }))
vi.mock('@/hooks/use-catalog-writes', () => ({ useCatalogWrites: () => writes }))
vi.mock('@/hooks/use-site-settings', () => ({ useSaveSiteSection: () => reorder }))

beforeEach(() => {
  vi.resetAllMocks()
  catalog.categories = [{ id: 1, name: 'Lights' }, { id: 2, name: 'Effects' }]
  catalog.isLoaded = true
  catalog.error = null
})

describe('Category administration', () => {
  it('does not save on blur or cancellation, and saves a trimmed name once on click', async () => {
    const user = userEvent.setup()
    render(<CategoryManager />)
    await user.click(screen.getByRole('button', { name: 'Editar Lights' }))
    const input = screen.getByRole('textbox', { name: 'Nombre de la categoría' })
    await user.clear(input)
    await user.type(input, ' Wash ')
    await user.click(screen.getByRole('button', { name: 'Cancelar edición' }))
    expect(writes.updateCategory).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Editar Lights' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' Wash ' } })
    await user.click(screen.getByRole('button', { name: 'Guardar categoría' }))
    expect(writes.updateCategory).toHaveBeenCalledExactlyOnceWith(1, 'Wash')
  })

  it('retains a failed rename for retry through Enter', async () => {
    writes.updateCategory.mockRejectedValueOnce(new Error('offline'))
    render(<CategoryManager />)
    fireEvent.click(screen.getByRole('button', { name: 'Editar Lights' }))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Wash' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(input).toBeEnabled())
    expect(input).toHaveValue('Wash')
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())
    expect(writes.updateCategory).toHaveBeenCalledTimes(2)
  })

  it('keeps pending and failed deletion open, then closes only on success', async () => {
    let reject!: (error: Error) => void
    writes.deleteCategory.mockImplementationOnce(() => new Promise((_resolve, rejectPromise) => { reject = rejectPromise }))
    render(<CategoryManager />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Lights' }))
    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar Categoría' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(writes.deleteCategory).toHaveBeenCalledTimes(1)
    reject(new Error('offline'))
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Eliminar Categoría' })).toBeEnabled())
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar Categoría' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(writes.deleteCategory).toHaveBeenCalledTimes(2)
  })

  it('distinguishes loading and read failure from an empty Category list', () => {
    catalog.categories = []
    catalog.isLoaded = false
    const { rerender } = render(<CategoryManager />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando categorías')
    expect(screen.queryByText('No hay categorías definidas')).not.toBeInTheDocument()
    catalog.isLoaded = true
    catalog.error = new Error('offline')
    rerender(<CategoryManager />)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(catalog.refetch).toHaveBeenCalledOnce()
    expect(screen.queryByText('No hay categorías definidas')).not.toBeInTheDocument()
    catalog.error = null
    rerender(<CategoryManager />)
    expect(screen.getByText('No hay categorías definidas')).toBeInTheDocument()
  })
})
