import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import ProductDetail from './ProductDetail'

vi.mock('@/hooks/use-catalog', () => ({ useCatalog: () => ({ products: [], isLoaded: true, error: null }) }))
vi.mock('@/components/ui/navigation', () => ({ Navigation: () => null }))
vi.mock('@/hooks/useSEO', () => ({ useSEO: () => {} }))

it('renders not-found rather than loading for a loaded empty catalog', () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  render(<MemoryRouter initialEntries={['/producto/missing']}><Routes><Route path="/producto/:model" element={<ProductDetail />} /></Routes></MemoryRouter>)
  expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
  expect(screen.queryByText('Cargando producto...')).not.toBeInTheDocument()
})
