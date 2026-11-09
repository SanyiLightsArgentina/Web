import { useEffect, useState, type FormEvent } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './select'
import type { Product } from '@/data/products'
import type { Category } from '@/lib/catalog'
import { toast } from '@/hooks/use-toast'
import { productMedia, productMediaFields, type ProductDetailsDraft, type ProductMedia } from '@/lib/product-media'
import { MediaField } from './media-field'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  onSubmit: (details: ProductDetailsDraft, media: ProductMedia) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

function productDetails(product?: Product) {
  return {
    model: product?.model ?? '', description: product?.description ?? '',
    technical_description: product?.technical_description ?? '',
    category_id: product?.category_id ?? 0, new: product?.new ?? false,
  }
}

export function ProductForm({ product, categories, onSubmit, onCancel, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState(() => productDetails(product))
  const [media, setMedia] = useState(() => productMedia(product))

  useEffect(() => {
    setFormData(productDetails(product))
    setMedia(productMedia(product))
  }, [product])

  useEffect(() => {
    if (categories.length && !product && formData.category_id === 0) {
      setFormData(previous => ({ ...previous, category_id: categories[0].id }))
    }
  }, [categories, product, formData.category_id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading) return
    if (!formData.model.trim() || !formData.description.trim() || !formData.category_id) {
      toast({ title: 'No se pudo guardar', description: 'Completá el modelo, la descripción y la categoría.', variant: 'destructive' })
      return
    }
    try {
      await onSubmit({ ...formData, id: product?.id }, media)
    } catch {
      // The publishing module reports the failure and retains progress for retry.
    }
  }

  const busy = loading
  return <div className="bg-white rounded-lg border p-6 max-w-4xl mx-auto product-form-container">
    <div className="mb-6"><h3 className="text-lg font-semibold text-gray-900">{product ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3></div>
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <fieldset disabled={busy} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="model">Modelo *</Label>
            <Input id="model" value={formData.model} onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} required placeholder="SPL-LED-700" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoría *</Label>
            {!categories.length ? <div className="p-3 border border-red-200 rounded-md bg-red-50"><span className="text-sm text-red-600">No hay categorías disponibles. Por favor, crea algunas categorías primero.</span></div> :
              <Select value={formData.category_id > 0 ? String(formData.category_id) : ''} onValueChange={value => setFormData(p => ({ ...p, category_id: Number(value) }))}>
                <SelectTrigger id="category"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                <SelectContent><SelectGroup>{categories.map(category => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>}
          </div>
        </div>
        <div className="flex flex-col gap-2"><Label htmlFor="description">Descripción *</Label><Textarea id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required placeholder="Descripción del producto..." rows={3} /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="technical_description">Descripción Técnica</Label><Textarea id="technical_description" value={formData.technical_description} onChange={e => setFormData(p => ({ ...p, technical_description: e.target.value }))} placeholder="Especificaciones técnicas detalladas" rows={8} className="text-sm" /></div>
        {productMediaFields.map(field => <MediaField key={`${product?.id ?? product?.model ?? 'new'}-${field}`} field={field} model={formData.model} items={media[field]} disabled={busy} onChange={items => setMedia(p => ({ ...p, [field]: items }))} />)}
        <div className="flex items-center gap-2"><input type="checkbox" id="new" checked={formData.new} onChange={e => setFormData(p => ({ ...p, new: e.target.checked }))} className="rounded" /><Label htmlFor="new">Producto nuevo</Label></div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Cancelar</Button>
          <Button type="submit" disabled={busy || !categories.length}>{busy ? 'Guardando...' : !categories.length ? 'Sin categorías' : product ? 'Actualizar Producto' : 'Crear Producto'}</Button>
        </div>
      </fieldset>
    </form>
  </div>
}
