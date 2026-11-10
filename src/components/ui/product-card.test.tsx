import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { QuoteListProvider } from '@/hooks/use-quote-list'
import { presentProduct } from '@/lib/product-presentation'
import { ProductCard } from './product-card'

// A non-Storage image URL passes through unchanged for every size.
const presentation = presentProduct({
  model: 'SPL LED 800',
  description: 'LED moving head',
  category_id: 2,
  category_name: 'Moving Head',
  images: ['https://example.com/card.webp'],
  contents: [],
  videos: [],
  new: true,
})

function renderCard() {
  return render(
    <MemoryRouter>
      <QuoteListProvider>
        <ProductCard product={presentation} />
      </QuoteListProvider>
    </MemoryRouter>,
  )
}

describe('ProductCard', () => {
  it('links to the encoded product route and renders the view model', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/producto/${encodeURIComponent('SPL LED 800')}`)
    expect(screen.getByRole('heading', { name: 'SPL LED 800' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'LED moving head' })).toHaveAttribute(
      'src',
      'https://example.com/card.webp',
    )
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('toggles the quote list from the card', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Cotizar' }))
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar' }))
    expect(screen.getByRole('button', { name: 'Cotizar' })).toBeInTheDocument()
  })

  it('notifies the surface when navigation starts', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <MemoryRouter>
        <QuoteListProvider>
          <ProductCard product={presentation} onNavigate={onNavigate} />
        </QuoteListProvider>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('heading', { name: 'SPL LED 800' }))
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
