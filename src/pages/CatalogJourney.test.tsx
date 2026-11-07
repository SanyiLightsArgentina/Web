import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { QuoteListProvider } from '@/hooks/use-quote-list'
import type { CatalogProduct } from '@/lib/catalog'
import Products from './Products'
import ProductDetail from './ProductDetail'

const catalog = vi.hoisted(() => ({ products: [] as CatalogProduct[], categories: [{ id: 1, name: 'Lights' }], isLoaded: true, error: null, refetch: vi.fn() }))
vi.mock('@/hooks/use-catalog', () => ({ useCatalog: () => catalog }))
vi.mock('@/hooks/useSEO', () => ({ useSEO: () => {} }))
vi.mock('@/components/sections/Footer', () => ({ Footer: () => null }))

function LocationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output data-testid="location">{location.pathname + location.search}</output><button onClick={() => navigate(-1)}>Browser Back</button></>
}
function app(entry: string) {
  return <MemoryRouter initialEntries={[entry]}><QuoteListProvider>
    <LocationProbe />
    <Routes>
      <Route path="/productos" element={<Products />} />
      <Route path="/producto/:model" element={<ProductDetail />} />
    </Routes>
  </QuoteListProvider></MemoryRouter>
}

beforeEach(() => {
  catalog.isLoaded = true
  catalog.products = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1, model: `Lamp ${String(index).padStart(2, '0')}`, description: 'LED lighting',
    category_id: 1, category_name: 'Lights', new: true, images: [], contents: [], videos: [],
  }))
  Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 })
  vi.spyOn(window, 'scrollTo').mockImplementation((options?: ScrollToOptions | number, y?: number) => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: typeof options === 'number' ? y ?? 0 : options?.top ?? 0 })
  })
})
afterEach(() => vi.restoreAllMocks())

describe('catalog → Product → catalog', () => {
  it('preserves filters, page and position through search and related Products', async () => {
    const user = userEvent.setup()
    const origin = '/productos?categoria=Lights&q=Lamp&nuevos=1&pagina=2'
    render(app(origin))
    Object.defineProperty(window, 'scrollY', { value: 640 })
    fireEvent.scroll(window)
    await user.click(screen.getByRole('button', { name: 'Buscar productos' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByPlaceholderText('Buscar por nombre, categoría o descripción...'), 'Lamp 00')
    await user.click(within(dialog).getByRole('button', { name: 'Ver Detalles' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Lamp 00' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Productos' })).toHaveAttribute('href', origin)
    await user.click(screen.getByRole('heading', { name: 'Lamp 01' }).closest('a')!)
    expect(screen.getByRole('heading', { level: 1, name: 'Lamp 01' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver a Productos' }))
    expect(screen.getByTestId('location')).toHaveTextContent(origin)
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 640, behavior: 'instant' })
    expect(screen.getByRole('heading', { name: 'Lamp 20' })).toBeInTheDocument()
  })

  it('preserves ordinary card navigation and browser Back', async () => {
    const user = userEvent.setup()
    const origin = '/productos?categoria=Lights&pagina=2'
    render(app(origin))
    await user.click(screen.getByRole('heading', { name: 'Lamp 20' }).closest('a')!)
    expect(screen.getByRole('link', { name: 'Volver a Productos' })).toHaveAttribute('href', origin)
    await user.click(screen.getByRole('button', { name: 'Browser Back' }))
    expect(screen.getByTestId('location')).toHaveTextContent(origin)
    expect(screen.getByRole('heading', { name: 'Lamp 20' })).toBeInTheDocument()
  })

  it('falls back to the unfiltered catalog on direct Product entry', () => {
    render(app('/producto/Lamp%2000'))
    expect(screen.getByRole('link', { name: 'Volver a Productos' })).toHaveAttribute('href', '/productos')
  })

  it('retains return context when a Product is no longer available', async () => {
    const user = userEvent.setup()
    const origin = '/productos?categoria=Lights&pagina=2'
    const view = render(app(origin))
    await user.click(screen.getByRole('heading', { name: 'Lamp 20' }).closest('a')!)
    catalog.products = []
    view.rerender(app(origin))
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Volver a Productos' }))
    expect(screen.getByTestId('location')).toHaveTextContent(origin)
  })

  it('restores position only after the returned catalog has loaded', async () => {
    const user = userEvent.setup()
    const origin = '/productos?q=Lamp&pagina=2'
    const view = render(app(origin))
    Object.defineProperty(window, 'scrollY', { value: 920 })
    fireEvent.scroll(window)
    await user.click(screen.getByRole('heading', { name: 'Lamp 20' }).closest('a')!)
    catalog.isLoaded = false
    vi.mocked(window.scrollTo).mockClear()
    await user.click(screen.getByRole('link', { name: 'Volver a Productos' }))
    expect(window.scrollTo).not.toHaveBeenCalled()
    catalog.isLoaded = true
    view.rerender(app(origin))
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 920, behavior: 'instant' })
  })

  it('resets pagination when changing filters', () => {
    render(app('/productos?q=Lamp&pagina=2'))
    fireEvent.change(screen.getByPlaceholderText('Buscar productos...'), { target: { value: 'Lamp 01' } })
    expect(screen.getByTestId('location')).toHaveTextContent('/productos?q=Lamp+01')
    expect(screen.getByTestId('location')).not.toHaveTextContent('pagina=')
  })
})
