import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Search, SlidersHorizontal, ArrowUpRight, MessageCircle, X } from 'lucide-react';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCatalog } from '@/hooks/use-catalog';
import { useSEO } from '@/hooks/useSEO';
import { presentProduct } from '@/lib/product-presentation';
import { isWebUrl } from '@/lib/site-settings';
import { consoleProfiles, resourceLabel } from '@/lib/support-resources';
import { openWhatsApp } from '@/lib/contact';

export default function Support() {
  useSEO({ title: 'Soporte y centro de descargas', description: 'Descargá manuales, documentación técnica y perfiles para consolas de iluminación Sanyi Lights.' });
  const { products, categories, isLoaded, error, refetch } = useCatalog();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [onlyNew, setOnlyNew] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const withFiles = products
    .map(product => ({ ...presentProduct(product, categories), files: (product.contents ?? []).filter(isWebUrl) }))
    .filter(product => product.files.length > 0);
  const availableCategories = categories.filter(c => withFiles.some(p => p.categoryId === c.id));
  const filtered = withFiles.filter(p =>
    (!onlyNew || p.isNew) && (category === 'all' || String(p.categoryId) === category) &&
    `${p.model} ${p.description}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const reset = () => { setSearch(''); setCategory('all'); setOnlyNew(false); };

  return <div className="min-h-screen bg-background">
    <Navigation />
    <main className="pt-20">
      <section className="bg-gradient-to-b from-muted/60 to-background border-b py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4"><Download className="h-5 w-5" />SOPORTE</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Centro de descargas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Manuales, documentación técnica y perfiles para consolas. Encontrá los archivos que necesitás para trabajar con tu equipo Sanyi.</p>
          <div className="flex flex-wrap gap-3 mt-8"><Button asChild><a href="#manuales">Buscar mi equipo<Search className="ml-2 h-4 w-4" /></a></Button><Button asChild variant="outline"><a href="#perfiles">Perfiles para consolas<SlidersHorizontal className="ml-2 h-4 w-4" /></a></Button></div>
        </div>
      </section>

      <section id="manuales" className="container mx-auto px-4 py-12 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div><h2 className="text-2xl sm:text-3xl font-bold mb-2">Documentación por equipo</h2><p className="text-muted-foreground">Buscá por modelo o filtrá por categoría.</p></div>
          {isLoaded && <p aria-live="polite" className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'equipo con archivos' : 'equipos con archivos'}</p>}
        </div>
        <div className="rounded-xl border bg-muted/20 p-4 mb-8 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar archivos por modelo" placeholder="Buscar por modelo, por ejemplo SPL-LED-800" className="pl-10 bg-background" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <Button variant={onlyNew ? 'default' : 'outline'} aria-pressed={onlyNew} onClick={() => setOnlyNew(v => !v)}>Solo novedades</Button>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Categorías de descargas">
            <Button size="sm" variant={category === 'all' ? 'default' : 'outline'} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Todas</Button>
            {availableCategories.map(c => <Button key={c.id} size="sm" variant={category === String(c.id) ? 'default' : 'outline'} aria-pressed={category === String(c.id)} onClick={() => setCategory(String(c.id))}>{c.name}</Button>)}
          </div>
        </div>
        {error ? <div role="alert" className="py-12 text-center"><p className="text-muted-foreground mb-4">No se pudieron cargar los archivos.</p><Button variant="outline" onClick={() => refetch()}>Reintentar</Button></div> : !isLoaded ? <p role="status" className="py-12 text-center text-muted-foreground">Cargando archivos...</p> : filtered.length === 0 ? <div className="text-center rounded-xl border border-dashed py-12 px-4"><FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-lg mb-2">No encontramos archivos para esta búsqueda</h3><p className="text-muted-foreground mb-4">Probá con otro modelo o consultanos por WhatsApp.</p><Button variant="outline" onClick={reset}><X className="h-4 w-4 mr-2" />Limpiar filtros</Button></div> :
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => <article key={product.id ?? product.model} className="rounded-xl border bg-card overflow-hidden flex flex-col">
              <div className="p-5 flex items-center gap-4 border-b">
                <img src={product.thumbImage} alt={product.model} loading="lazy" className="w-20 h-20 object-contain shrink-0" />
                <div className="min-w-0"><div className="flex flex-wrap gap-2 items-center mb-1"><h3 className="font-bold break-words">{product.model}</h3>{product.isNew && <Badge className="bg-green-600">Nuevo</Badge>}</div><p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p></div>
              </div>
              <ul className="p-5 space-y-3 flex-1">{product.files.map((url, index) => {
                const resource = resourceLabel(url, index);
                return <li key={`${url}-${index}`}><a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Abrir ${resource.name} ${index + 1} de ${product.model}`}><div className="flex gap-3 items-center"><FileText className="w-5 h-5 text-primary shrink-0" /><div><span className="block text-sm font-medium">{resource.name}{product.files.length > 1 ? ` ${index + 1}` : ''}</span><span className="text-xs text-muted-foreground">{resource.format} · Abrir / descargar</span></div></div><Download className="w-4 h-4 shrink-0" /></a></li>;
              })}</ul>
              <Link className="text-sm font-medium text-primary px-5 pb-5 inline-flex items-center gap-1" to={product.href}>Ver equipo<ArrowUpRight className="h-4 w-4" /></Link>
            </article>)}
          </div>}
      </section>

      <section id="perfiles" className="bg-muted/30 py-12 scroll-mt-20">
        <div className="container mx-auto px-4"><h2 className="text-2xl sm:text-3xl font-bold mb-3">Perfiles para consolas</h2><p className="text-muted-foreground max-w-2xl mb-8">Accedé a las bibliotecas internacionales de Sanyi Lights y buscá el perfil correspondiente a tu equipo y consola.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{consoleProfiles.map(profile => <a key={profile.url} href={profile.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-card p-5 hover:border-primary transition-colors group"><SlidersHorizontal className="h-6 w-6 text-primary mb-5" /><h3 className="font-semibold mb-1">{profile.name}</h3><p className="text-sm text-muted-foreground mb-5">Formato {profile.format}</p><span className="inline-flex gap-1 items-center text-sm text-primary font-medium">Abrir biblioteca<ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></span></a>)}</div><a href="https://sanyilights.us/download-center/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 mt-6">Ver centro de descargas internacional<ArrowUpRight className="h-4 w-4" /></a></div>
      </section>
      <section className="container mx-auto px-4 py-12"><div className="rounded-xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"><div><h2 className="text-2xl font-bold mb-2">¿Necesitás ayuda con tu equipo?</h2><p className="text-muted-foreground">Consultanos si no encontrás el manual o el perfil que buscás.</p></div><Button onClick={openWhatsApp} size="lg" className="shrink-0"><MessageCircle className="mr-2 h-5 w-5" />Contactar a soporte</Button></div></section>
    </main>
    <Footer />
  </div>;
}
