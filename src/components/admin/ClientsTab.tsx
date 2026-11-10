import type { SetStateAction } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClientLogo } from '@/components/ui/client-logo';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useSiteDraft } from '@/hooks/use-site-draft';
import { useToast } from '@/hooks/use-toast';
import { SITE_SECTION_LIMITS, type SiteClient, type SiteSettings } from '@/lib/site-settings';

export function ClientsTab() {
  const { settings, isLoading, isError, refetch } = useSiteSettings();
  if (isLoading) return <p role="status">Cargando clientes...</p>;
  if (isError) return <div role="alert">No se pudieron cargar los clientes. <Button onClick={() => refetch()}>Reintentar</Button></div>;
  return <ClientsEditor initial={settings} />;
}

function ClientsEditor({ initial }: { initial: SiteSettings }) {
  const { draft, setDraft, submit, busy, isSaving, isUploading, upload, moved } = useSiteDraft(initial, 'clients');
  const clients = draft.clients;
  const setClients = (action: SetStateAction<SiteClient[]>) => setDraft(previous => ({ ...previous, clients: typeof action === 'function' ? action(previous.clients) : action }));
  const { toast } = useToast();
  const update = (id: string, updates: Partial<SiteClient>) => setClients(items => items.map(item => item.id === id ? { ...item, ...updates } : item));
  const move = (index: number, direction: number) => setClients(items => moved(items, index, index + direction));

  const uploadLogo = async (id: string, file?: File) => {
    if (!file || busy) return;
    try {
      const logo = await upload(file, { kind: 'client-logo', clientId: id });
      update(id, { logo });
    } catch (error) {
      toast({
        title: 'No se pudo subir el logo',
        description: error instanceof Error ? error.message : 'Volvé a intentar. Los datos ingresados se conservan.',
        variant: 'destructive',
      });
    }
  };

  return <Card>
    <CardHeader><CardTitle>Empresas que trabajan con nosotros</CardTitle></CardHeader>
    <CardContent>
      <form onSubmit={submit} className="space-y-6">
        <p className="text-sm text-muted-foreground">Agregá las empresas, sus logos y el enlace a sus sitios. El orden de esta lista se usa en el inicio. La sección aparece en el inicio cuando hay al menos una empresa cargada.</p>
        <fieldset disabled={busy} className="space-y-4">
          {clients.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Todavía no agregaste clientes.</div>}
          {clients.map((client, index) => <div key={client.id} className="rounded-lg border p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Empresa {index + 1}</h3>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon" aria-label={`Subir empresa ${index + 1}`} disabled={index === 0 || busy} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label={`Bajar empresa ${index + 1}`} disabled={index === clients.length - 1 || busy} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label={`Eliminar empresa ${index + 1}`} onClick={() => setClients(items => items.filter(item => item.id !== client.id))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <Label className="grid gap-2">Nombre de la empresa<Input value={client.company} maxLength={SITE_SECTION_LIMITS.maxCompanyLength} required placeholder="Nombre de la empresa" onChange={event => update(client.id, { company: event.target.value })} /></Label>
            <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-28 rounded-lg border bg-white flex items-center justify-center p-3"><ClientLogo company={client.company || 'la empresa'} src={client.logo} /></div>
              <div className="space-y-4">
                <Label className="grid gap-2">URL del logo<Input type="url" value={client.logo} placeholder="https://empresa.com/logo.png" onChange={event => update(client.id, { logo: event.target.value })} /></Label>
                <Label className="grid gap-2">O subir logo (PNG, JPG, WebP)<Input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { void uploadLogo(client.id, event.target.files?.[0]); event.target.value = ''; }} /></Label>
              </div>
            </div>
            <Label className="grid gap-2">Link de la empresa (opcional)<Input type="url" value={client.link} placeholder="https://empresa.com" onChange={event => update(client.id, { link: event.target.value })} /></Label>
          </div>)}
          <Button type="button" variant="outline" disabled={clients.length >= SITE_SECTION_LIMITS.maxClients} onClick={() => setClients(items => [...items, { id: crypto.randomUUID(), company: '', logo: '', link: '' }])}><Plus className="mr-2 h-4 w-4" />Agregar empresa</Button>
        </fieldset>
        <Button type="submit" disabled={busy}>{isUploading ? 'Subiendo logo...' : isSaving ? 'Guardando...' : 'Guardar clientes'}</Button>
      </form>
    </CardContent>
  </Card>;
}
