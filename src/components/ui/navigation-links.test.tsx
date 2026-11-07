import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { NavigationLinks } from './navigation-links'

vi.mock('@/hooks/use-catalog', () => ({ useCatalog: () => ({ categories: [{ id: 1, name: 'Wash & LED' }, { id: 2, name: 'Todos' }] }) }))
function Location() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output>{location.pathname + location.search}</output><button onClick={() => navigate(-1)}>Back</button></>
}
describe('category navigation', () => {
  it.each(['desktop', 'mobile'] as const)('uses shareable category links in %s layout', layout => {
    const onNavigate = vi.fn()
    render(<MemoryRouter><NavigationLinks layout={layout} onContact={vi.fn()} onNavigate={onNavigate} /><Location /></MemoryRouter>)
    fireEvent.click(screen.getByRole('link', { name: 'Wash & LED' }))
    expect(screen.getByRole('status').textContent).toBe('/productos?categoria=Wash+%26+LED')
    expect(onNavigate).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByRole('status').textContent).toBe('/')
  })
})
