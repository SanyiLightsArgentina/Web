import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import type { CatalogProduct, Category } from '@/lib/catalog'
import Support from './Support'
import { ProductSpecifications } from '@/components/product/ProductSpecifications'

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
  // Older rows can have NULL in the database even though the local type is optional.
  catalog.products = [product, { ...product, model: 'Legacy Lamp', contents: null as unknown as undefined }]

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


it('shows the same published files and formats in support and Product specifications', () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const pdf = 'https://example.com/files/manual%2EPDF?token=abc#page=2'
  const image = 'https://example.com/spec.webp#full'
  const other = 'https://example.com/fixture.zip'
  const contents = [pdf, '/legacy.pdf', image, 'javascript:alert(1)', other]
  catalog.products = [{
    model: 'Lamp', description: 'Light', category_id: 1, category_name: 'Wash', new: false, contents,
  }]
  catalog.categories = [{ id: 1, name: 'Wash' }]

  render(
    <MemoryRouter>
      <section aria-label="Soporte"><Support /></section>
      <section aria-label="Especificaciones"><ProductSpecifications contents={contents} /></section>
    </MemoryRouter>,
  )

  for (const name of ['Soporte', 'Especificaciones']) {
    const panel = within(screen.getByRole('region', { name }))
    const links = panel.getAllByRole('link').map(link => link.getAttribute('href'))
    expect(links).toEqual(expect.arrayContaining([pdf, image, other]))
    expect(links).not.toContain('/legacy.pdf')
    expect(links).not.toContain('javascript:alert(1)')
    for (const format of ['PDF', 'WEBP', 'ZIP']) {
      expect(panel.getByText(new RegExp('^' + format))).toBeInTheDocument()
    }
  }
})
