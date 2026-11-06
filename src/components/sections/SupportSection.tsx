import { Link } from 'react-router-dom';
import { Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SupportSection() {
  return (
    <section className="bg-muted/40 py-16">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3"><Download className="h-5 w-5" />Soporte técnico</div>
          <h2 className="text-3xl font-bold mb-4">Todo para poner tus equipos en marcha</h2>
          <p className="text-muted-foreground text-lg">Encontrá manuales, especificaciones y perfiles para consolas en nuestro centro de descargas.</p>
        </div>
        <Button asChild size="lg" className="shrink-0"><Link to="/soporte">Centro de descargas<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>
    </section>
  );
}
