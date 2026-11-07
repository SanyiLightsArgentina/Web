import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { openWhatsApp } from '@/lib/contact'
import NotFound from './NotFound'

vi.mock('@/lib/contact', () => ({ openWhatsApp: vi.fn() }))
vi.mock('@/hooks/useSEO', () => ({ useSEO: () => {} }))

it('uses the shared configurable contact action on the 404 page', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  render(<MemoryRouter initialEntries={['/missing']}><NotFound /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Contactar por WhatsApp' }))
  expect(openWhatsApp).toHaveBeenCalledOnce()
})
