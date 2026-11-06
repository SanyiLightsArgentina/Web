import { ArrowUpRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { isWebUrl } from '@/lib/site-settings';
import { ClientLogo } from '@/components/ui/client-logo';

export function ClientsSection() {
  const { settings } = useSiteSettings();
  const clients = settings.clients;
  if (!clients.length) return null;

  return (
    <section id="clientes" aria-labelledby="clients-title" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Nuestros clientes</p>
          <h2 id="clients-title" className="text-3xl md:text-4xl font-bold mb-4">Empresas que trabajan con nosotros</h2>
          <p className="text-muted-foreground text-lg">Acompañamos a quienes hacen posible cada evento, espectáculo y producción.</p>
        </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {clients.map(client => {
              const content = <>
                <div className="h-24 sm:h-28 w-full flex items-center justify-center px-2"><ClientLogo company={client.company} src={client.logo} /></div>
                <div className="flex items-center justify-center gap-1.5 mt-5"><span className="font-medium text-sm sm:text-base text-center break-words min-w-0">{client.company}</span>{isWebUrl(client.link) && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />}</div>
              </>;
              const className = 'h-full flex flex-col items-center justify-center rounded-xl border border-border bg-card px-4 py-6 sm:p-7';
              return <li key={client.id}>{isWebUrl(client.link) ? <a href={client.link} target="_blank" rel="noopener noreferrer" aria-label={`${client.company} (abre en una nueva pestaña)`} className={`${className} transition-colors hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}>{content}</a> : <div className={className}>{content}</div>}</li>;
            })}
          </ul>

      </div>
    </section>
  );
}
