import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import type { CatalogProduct, Category } from '@/lib/catalog'
import Support from './Support'

const catalog = vi.hoisted(() => ({
  products: [] as CatalogProduct[],
  categories: [] as Category[],
  isLoaded: true,
  error: null,
  refetch: vi.fn(),
}))
vi.mock('@/hooks/use-catalog', () => ({ useCatalog: () => catalog }))
vi.mock('@/components/ui/navigation', () => ({ Navigation: () => null }))
vi.mock('@/components/sections/Footer', () => ({ Footer: () => null }))

it('refreshes searchable downloads and category buttons when the catalog changes', () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const manual = 'https://example.com/manual.pdf'
  const product = {
    model: 'LED Wash 800',
    description: 'Professional lighting',
    category_id: 1,
    category_name: 'Wash',
    new: false,
    contents: ['old-file', manual],
  }
  catalog.categories = [{ id: 1, name: 'Wash' }, { id: 2, name: 'Beam' }]
  catalog.products = [product]

  const page = () => (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Support />
    </MemoryRouter>
  )
  const { rerender } = render(page())
  const input = screen.getByRole('textbox', { name: 'Buscar archivos por modelo' })
  fireEvent.change(input, { target: { value: 'wash' } })
  const categoryButtons = within(screen.getByLabelText('Categorías de descargas'))
  expect(categoryButtons.getByRole('button', { name: 'Wash' })).toBeInTheDocument()
  expect(categoryButtons.queryByRole('button', { name: 'Beam' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Abrir Manual / documento técnico 1 de LED Wash 800' }))
    .toHaveAttribute('href', manual)

  catalog.categories = [{ id: 1, name: 'Wash LED' }, { id: 2, name: 'Beam' }]
  rerender(page())
  expect(categoryButtons.getByRole('button', { name: 'Wash LED' })).toBeInTheDocument()

  const spec = 'https://example.com/spec.webp'
  catalog.products = [
    { ...product, contents: ['ftp://example.com/manual.pdf'] },
    { ...product, model: 'LED Wash 900', category_id: 2, category_name: 'Beam', contents: [spec] },
  ]
  rerender(page())
  expect(input).toHaveValue('wash')
  expect(categoryButtons.queryByRole('button', { name: 'Wash LED' })).not.toBeInTheDocument()
  expect(categoryButtons.getByRole('button', { name: 'Beam' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'LED Wash 800' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Abrir Ficha de especificaciones 1 de LED Wash 900' }))
    .toHaveAttribute('href', spec)
})
