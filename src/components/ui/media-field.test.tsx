import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaField } from './media-field'
import type { MediaItem } from '@/lib/product-media'

function Editor() {
  const [items, setItems] = useState<MediaItem[]>([])
  return <MediaField field="images" model="Lamp" items={items} onChange={setItems} disabled={false} />
}

afterEach(() => vi.unstubAllGlobals())

describe('MediaField', () => {
  it('adds a URL and removes it through confirmation', () => {
    render(<Editor />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Agregar URL de imagen' }), { target: { value: ' https://example.com/lamp.png ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar URL de imagen' }))
    expect(screen.getByAltText('Vista previa')).toHaveAttribute('src', 'https://example.com/lamp.png')
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar imagen 1' }))
    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
    expect(screen.queryByAltText('Vista previa')).not.toBeInTheDocument()
  })

  it('revokes a local file preview on unmount', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:preview')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
    const { unmount } = render(<Editor />)
    fireEvent.change(screen.getByLabelText('Subir imágenes'), { target: { files: [new File(['image'], 'lamp.png', { type: 'image/png' })] } })
    expect(screen.getByAltText('Vista previa')).toHaveAttribute('src', 'blob:preview')
    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })
})
