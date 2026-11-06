import { useMediaUpload } from '@/hooks/use-media-upload';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSiteSettings, useSaveSiteSection } from '@/hooks/use-site-settings';
import { isWebUrl, youtubeId, isDirectVideoUrl, type SiteSettings } from '@/lib/site-settings';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

type Section = 'hero' | 'videos' | 'contact';

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string;
}) {
  return <Label className="grid gap-2">{label}<Input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></Label>;
}
function ListActions({ index, length, move, remove }: { index: number; length: number; move: (to: number) => void; remove: () => void }) {
  return <div className="flex gap-2">
    <Button type="button" variant="outline" size="icon" aria-label="Subir" disabled={index === 0} onClick={() => move(index - 1)}><ArrowUp className="h-4 w-4" /></Button>
    <Button type="button" variant="outline" size="icon" aria-label="Bajar" disabled={index === length - 1} onClick={() => move(index + 1)}><ArrowDown className="h-4 w-4" /></Button>
    <Button type="button" variant="outline" size="icon" aria-label="Eliminar" disabled={length === 1} onClick={remove}><Trash2 className="h-4 w-4" /></Button>
  </div>;
}
function moved<T>(items: T[], from: number, to: number): T[] {
  const copy = [...items];
  copy.splice(to, 0, copy.splice(from, 1)[0]);
  return copy;
}

export function SiteContentTab({ section }: { section: Section }) {
  const { settings, isLoading, isError, refetch } = useSiteSettings();
  if (isLoading) return <p>Cargando configuración...</p>;
  if (isError) return <div role="alert">No se pudo cargar la configuración. <Button onClick={() => refetch()}>Reintentar</Button></div>;
  return <ContentEditor key={section} section={section} initial={settings} />;
}

function ContentEditor({ section, initial }: { section: Section; initial: SiteSettings }) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const save = useSaveSiteSection();
  const { upload, isUploading } = useMediaUpload();
  const { toast } = useToast();
  const setHero = (index: number, updates: Partial<SiteSettings['hero'][number]>) => setDraft(d => ({ ...d, hero: d.hero.map((slide, i) => i === index ? { ...slide, ...updates } : slide) }));
  const setVideo = (index: number, updates: Partial<SiteSettings['videos']['items'][number]>) => setDraft(d => ({ ...d, videos: { ...d.videos, items: d.videos.items.map((video, i) => i === index ? { ...video, ...updates } : video) } }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (save.isPending || isUploading) return;
    let error = '';
    if (section === 'hero' && (!draft.hero.length || draft.hero.some(s => !s.title.trim() || !isWebUrl(s.src) || !/^\/(?!\/)/.test(s.productRoute)))) error = 'Completá cada slide con título, URL de imagen o video y una ruta del sitio (por ejemplo /productos).';
    if (section === 'videos' && (!isWebUrl(draft.videos.channelUrl) || draft.videos.items.some(v => !v.title.trim() || (!youtubeId(v.url) && !isDirectVideoUrl(v.url))))) error = 'Completá los títulos y usá enlaces de YouTube o URLs de archivos MP4/WebM para los videos.';
    if (section === 'contact' && (!/^\d{8,15}$/.test(draft.contact.phone) || !draft.contact.phoneLabel.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.email) || !isWebUrl(draft.contact.instagram) || !isWebUrl(draft.contact.facebook))) error = 'Revisá el WhatsApp (código de país y número, solo dígitos), el teléfono visible, el email y las redes sociales.';
    if (error) { toast({ title: 'Revisá los datos', description: error, variant: 'destructive' }); return; }
    try {
      await save.mutateAsync({ key: section, value: draft[section] });
      toast({ title: 'Cambios guardados', description: 'El sitio ya muestra la nueva configuración.' });
    } catch (err) { toast({ title: 'Error al guardar', description: err instanceof Error ? err.message : 'Volvé a intentar.', variant: 'destructive' }); }
  };

  const uploadVideo = async (file: File | undefined, update: (url: string) => void) => {
    if (!file) return;
    try {
      const url = await upload(file, { kind: 'site-video', section: section === 'hero' ? 'hero' : 'videos' });
      if (url) update(url);
    } catch (error) {
      toast({ title: 'No se pudo subir el video', description: error instanceof Error ? error.message : 'Volvé a intentar.', variant: 'destructive' });
    }
  };

  const contactLabels: Record<keyof SiteSettings['contact'], string> = {
    phone: 'WhatsApp (código de país y número, sin + ni espacios)', phoneLabel: 'Teléfono visible',
    email: 'Email', address: 'Dirección', city: 'Ciudad', hours: 'Horario de atención',
    instagram: 'URL de Instagram', facebook: 'URL de Facebook',
  };
  return <Card>
    <CardHeader><CardTitle>{section === 'hero' ? 'Hero de inicio' : section === 'videos' ? 'Página de videos' : 'Datos de contacto'}</CardTitle></CardHeader>
    <CardContent><form onSubmit={submit} className="space-y-6">
      <fieldset disabled={save.isPending || isUploading} className="space-y-6">
        {section === 'hero' && <>
          <p className="text-sm text-muted-foreground">Elegí fotos, enlaces de YouTube o videos con URL directa (MP4/WebM). Las diapositivas rotan en el orden indicado.</p>
          {draft.hero.map((slide, index) => <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-medium">Diapositiva {index + 1}</h3><ListActions index={index} length={draft.hero.length} move={to => setDraft(d => ({ ...d, hero: moved(d.hero, index, to) }))} remove={() => setDraft(d => ({ ...d, hero: d.hero.filter((_, i) => i !== index) }))} /></div>
            <Label className="grid gap-2">Tipo de contenido<select value={slide.type} onChange={e => setHero(index, { type: e.target.value as 'image' | 'video' })} className="h-10 rounded-md border bg-background px-3"><option value="video">Video</option><option value="image">Foto</option></select></Label>
            <Field label={slide.type === 'image' ? 'URL de la foto' : 'URL del video'} type="url" value={slide.src} onChange={src => setHero(index, { src })} />
            {slide.type === 'video' && <Label className="grid gap-2">Subir video MP4 / WebM<Input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={event => { void uploadVideo(event.target.files?.[0], src => setHero(index, { src })); event.target.value = ''; }} /></Label>}
            {slide.type === 'image' && isWebUrl(slide.src) && <img src={slide.src} alt="Vista previa del hero" className="max-h-48 rounded object-cover" />}
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Título" value={slide.title} onChange={title => setHero(index, { title })} /><Field label="Subtítulo" value={slide.subtitle} onChange={subtitle => setHero(index, { subtitle })} /></div>
            <Field label="Destino de DESCUBRILO" value={slide.productRoute} placeholder="/producto/MODELO o /productos" onChange={productRoute => setHero(index, { productRoute })} />
            <Label className="flex items-center gap-2"><input type="checkbox" checked={slide.new} onChange={e => setHero(index, { new: e.target.checked })} />Mostrar etiqueta NUEVO</Label>
          </div>)}
          <Button type="button" variant="outline" onClick={() => setDraft(d => ({ ...d, hero: [...d.hero, { type: 'image', src: '', title: '', subtitle: '', productRoute: '/productos', new: false }] }))}><Plus className="h-4 w-4 mr-2" />Agregar diapositiva</Button>
        </>}
        {section === 'videos' && <>
          {draft.videos.items.map((video, index) => <div key={video.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-medium">Video {index + 1}</h3><ListActions index={index} length={draft.videos.items.length} move={to => setDraft(d => ({ ...d, videos: { ...d.videos, items: moved(d.videos.items, index, to) } }))} remove={() => setDraft(d => ({ ...d, videos: { ...d.videos, items: d.videos.items.filter((_, i) => i !== index) } }))} /></div>
            <Field label="Título del video" value={video.title} onChange={title => setVideo(index, { title })} /><Field label="URL del video (YouTube o MP4/WebM)" type="url" value={video.url} onChange={url => setVideo(index, { url })} />
            <Label className="grid gap-2">Subir video MP4 / WebM<Input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={event => { void uploadVideo(event.target.files?.[0], url => setVideo(index, { url })); event.target.value = ''; }} /></Label>
          </div>)}
          <Button type="button" variant="outline" onClick={() => setDraft(d => ({ ...d, videos: { ...d.videos, items: [...d.videos.items, { id: crypto.randomUUID(), title: '', url: '' }] } }))}><Plus className="h-4 w-4 mr-2" />Agregar video</Button>
          <Field label="Enlace de Ver Más Videos" type="url" value={draft.videos.channelUrl} onChange={channelUrl => setDraft(d => ({ ...d, videos: { ...d.videos, channelUrl } }))} />
        </>}
        {section === 'contact' && <div className="grid gap-4 sm:grid-cols-2">{(Object.keys(contactLabels) as (keyof SiteSettings['contact'])[]).map(key => <Field key={key} label={contactLabels[key]} value={draft.contact[key]} type={key === 'email' ? 'email' : ['instagram', 'facebook'].includes(key) ? 'url' : 'text'} onChange={value => setDraft(d => ({ ...d, contact: { ...d.contact, [key]: value } }))} />)}</div>}
      </fieldset>
      <Button type="submit" disabled={save.isPending || isUploading}>{isUploading ? 'Subiendo video...' : save.isPending ? 'Guardando...' : 'Guardar cambios'}</Button>
    </form></CardContent>
  </Card>;
}
