import { useEffect, useRef, useState } from 'react'
import { Eye, FileText, Image, Play, Plus, Video, X } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Dialog, DialogContent, DialogTitle } from './dialog'
import { ResponsiveDeleteModal } from './responsive-delete-modal'
import { toast } from '@/hooks/use-toast'
import { validateMedia } from '@/lib/media'
import type { MediaItem, ProductMedia } from '@/lib/product-media'
import { parseVideoSource } from '@/lib/video-source'

// Keep the existing field-specific visual design; behavior is shared.
const fields = {
  images: { title: 'Imágenes', singular: 'imagen', icon: Image, accept: 'image/*', kind: 'product-image', background: 'bg-gray-50', drop: 'border-blue-300 hover:border-blue-400 bg-blue-50 text-blue-600', placeholder: 'https://ejemplo.com/imagen.jpg', hint: 'o haz click para seleccionar archivos' },
  contents: { title: 'Contenidos', singular: 'contenido', icon: FileText, accept: '*/*', kind: 'product-content', background: 'bg-green-50', drop: 'border-green-300 hover:border-green-400 bg-green-50 text-green-600', placeholder: 'https://ejemplo.com/documento.pdf', hint: 'PDFs, documentos, imágenes o haz click para seleccionar' },
  videos: { title: 'Videos', singular: 'video', icon: Video, accept: 'video/*', kind: 'product-video', background: 'bg-purple-50', drop: 'border-purple-300 hover:border-purple-400 bg-purple-50 text-purple-600', placeholder: 'https://youtube.com/watch?v=... o https://ejemplo.com/video.mp4', hint: 'MP4, MOV, AVI o haz click para seleccionar' },
} as const

function ItemPreview({ item, field, onPreview }: { item: MediaItem; field: keyof ProductMedia; onPreview: (url: string) => void }) {
  const [objectUrl, setObjectUrl] = useState('')
  useEffect(() => {
    if (item.type !== 'file') return
    const url = URL.createObjectURL(item.value)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [item])
  const src = item.type === 'url' ? item.value : objectUrl
  const isImage = field === 'images' || (item.type === 'file' ? item.value.type.startsWith('image/') : /\.(png|jpg|jpeg|gif|webp|svg)(?:[?#]|$)/i.test(src))
  if (isImage) return <img src={src || undefined} alt="Vista previa" className="size-full object-cover cursor-pointer" onClick={() => onPreview(src)} />
  if (field === 'contents') return <FileText className="size-6 text-green-600" />
  const video = parseVideoSource(src)
  if (item.type === 'url' && video.kind !== 'direct') return <div className="text-center"><Play className="size-12 mx-auto mb-2" /><p className="text-sm font-medium">{video.kind === 'youtube' ? 'YouTube Video' : 'URL de video'}</p><p className="text-xs truncate">{src}</p></div>
  return <video src={src || undefined} className="size-full object-cover" controls preload="metadata" muted={item.type === 'file'} />
}

export function MediaField({ field, model, items, onChange, disabled }: {
  field: keyof ProductMedia; model: string; items: MediaItem[]; onChange: (items: MediaItem[]) => void; disabled: boolean
}) {
  const config = fields[field]
  const Icon = config.icon
  const input = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<MediaItem | null>(null)
  const addFiles = (files: File[]) => {
    if (disabled) return
    const accepted: MediaItem[] = []
    for (const file of files) {
      const problem = validateMedia({ kind: config.kind, model }, file)
      if (problem) toast({ title: 'No se pudo agregar el archivo', description: problem, variant: 'destructive' })
      else accepted.push({ type: 'file', value: file })
    }
    onChange([...items, ...accepted])
  }
  return <section className={`border border-gray-200 rounded-lg p-6 ${config.background}`} aria-label={config.title}>
    <div className="flex items-center gap-2 mb-4"><Icon className="size-5" /><h4 className="text-lg font-semibold text-gray-900">{config.title}</h4></div>
    <div className="flex flex-col gap-4">
      <input ref={input} type="file" multiple accept={config.accept} className="hidden" aria-label={`Subir ${config.title.toLowerCase()}`} disabled={disabled} onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }} />
      <button type="button" disabled={disabled} className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${config.drop}`} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)) }}>
        <Icon className="size-8 mx-auto mb-2" /><p className="text-sm font-medium">Arrastra y suelta {field === 'contents' ? 'archivos' : config.title.toLowerCase()} aquí</p><p className="text-xs">{config.hint}</p>
      </button>
      <div className="flex flex-col gap-2"><Label htmlFor={`${field}-url`}>Agregar URL de {config.singular}</Label><div className="flex gap-2">
        <Input id={`${field}-url`} value={url} onChange={e => setUrl(e.target.value)} placeholder={config.placeholder} className="flex-1" />
        <Button type="button" variant="outline" aria-label={`Agregar URL de ${config.singular}`} disabled={disabled} onClick={() => { if (url.trim()) { onChange([...items, { type: 'url', value: url.trim() }]); setUrl('') } }}><Plus data-icon="inline-start" /></Button>
      </div></div>
      {items.length > 0 && <div className="flex flex-col gap-3"><Label>{config.title} agregados:</Label><div className={field === 'images' ? 'grid grid-cols-2 md:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
        {items.map((item, index) => <div key={index} className={field === 'contents' ? 'flex items-center gap-3 p-3 bg-white rounded-lg border' : 'relative group'}>
          <div className={field === 'contents' ? 'size-12 shrink-0 rounded overflow-hidden flex items-center justify-center' : `w-full ${field === 'images' ? 'h-32' : 'h-40'} bg-gray-100 rounded-lg border overflow-hidden flex items-center justify-center`}><ItemPreview item={item} field={field} onPreview={setPreview} /></div>
          {field === 'contents' && <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{item.type === 'file' ? item.value.name : item.value.split('/').pop()}</p><p className="text-xs text-gray-500 truncate">{item.type === 'file' ? item.value.name : item.value}</p></div>}
          <div className={field === 'contents' ? 'flex gap-1' : 'absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'}><Button type="button" variant="ghost" size="sm" disabled={disabled} aria-label={`Eliminar ${config.singular} ${index + 1}`} onClick={() => setDeleting(item)}><X data-icon="inline-start" /></Button></div>
          {field === 'images' && item.type === 'url' && <Button type="button" variant="ghost" size="sm" aria-label={`Ver imagen ${index + 1}`} className="absolute top-2 right-2" onClick={() => setPreview(item.value)}><Eye data-icon="inline-start" /></Button>}
        </div>)}
      </div></div>}
    </div>
    <Dialog open={preview !== null} onOpenChange={open => { if (!open) setPreview(null) }}><DialogContent className="max-w-4xl"><DialogTitle className="sr-only">Vista previa completa</DialogTitle>{preview && <img src={preview} alt="Vista previa completa" className="w-full object-contain rounded-lg" />}</DialogContent></Dialog>
    {deleting && <ResponsiveDeleteModal isOpen onClose={() => setDeleting(null)} onConfirm={() => { if (!disabled) { onChange(items.filter(item => item !== deleting)); setDeleting(null) } }} title="Confirmar eliminación" description={`¿Estás seguro de que quieres eliminar este ${config.singular}?`} itemType={config.singular} itemUrl={deleting.type === 'url' ? deleting.value : undefined} confirmText="Eliminar" />}
  </section>
}
