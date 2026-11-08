import { productImageUrl } from '@/lib/product-images';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { SearchDialog } from './search-dialog';
import { NavigationLinks } from './navigation-links';
import { useCatalog } from '@/hooks/use-catalog';
import { findProductByModel } from '@/lib/catalog';
import logo from '/src/assets/logo.png';
import { useQuoteList } from '@/hooks/use-quote-list';
import { openWhatsAppForModels } from '@/lib/contact';

interface NavigationProps { isTransparent?: boolean }

export const Navigation = (_props: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const { items, remove, clear } = useQuoteList();
  const { products } = useCatalog();
  const scrollToContact = (event: MouseEvent) => {
    event.preventDefault();
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black backdrop-blur-md shadow-lg">
    <div className="container mx-auto px-4"><div className="flex items-center justify-between h-20">
      <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg"><img src={logo} alt="Sanyi Lights Argentina" className="w-16 h-16 object-contain" /></div>
        <div className="hidden sm:block"><span className="text-xl font-bold text-white">Sanyi Lights</span><span className="text-sm opacity-90 ml-2 text-white">Argentina</span></div>
      </Link>
      <NavigationLinks layout="desktop" onContact={scrollToContact} />
      <div className="flex items-center space-x-4">
        <SearchDialog />
        <Button variant="default" className="bg-primary text-white hover:bg-primary/90" onClick={() => setIsQuoteOpen(true)}>Cotizar lista ({items.length})</Button>
        <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
          <SheetContent side="right" className="w-[360px] sm:w-[420px] flex flex-col">
            <SheetHeader className="flex-shrink-0"><SheetTitle className="text-left">Lista de cotización</SheetTitle></SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map(model => {
                const product = findProductByModel(products, model);
                return <div key={model} className="flex items-center gap-3 p-3 rounded-md border bg-background">
                  <img src={productImageUrl(product?.images?.[0], 'thumb')} alt={product?.description || model} className="w-16 h-16 rounded object-contain bg-muted" onError={event => { event.currentTarget.style.visibility = 'hidden' }} />
                  <div className="flex-1 min-w-0"><div className="font-medium truncate">{product?.model || model}</div><div className="text-sm text-muted-foreground line-clamp-2">{product?.description || 'Producto'}</div></div>
                  <Button variant="ghost" size="icon" onClick={() => remove(model)} aria-label={`Quitar ${model}`}><X data-icon="inline-start" /></Button>
                </div>;
              })}
              {items.length === 0 && <div className="text-sm text-muted-foreground">No hay productos en la lista.</div>}
            </div>
            <div className="flex-shrink-0 space-y-2 pt-2"><div className="flex gap-2">
              <Button className="flex-1" onClick={() => { openWhatsAppForModels(items); setIsQuoteOpen(false) }} disabled={!items.length}>Enviar por WhatsApp</Button>
              <Button variant="secondary" onClick={clear} disabled={!items.length}>Vaciar</Button>
            </div></div>
          </SheetContent>
        </Sheet>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Abrir menú" className="xl:hidden transition-all duration-300 text-white"><Menu data-icon="inline-start" /></Button></SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
            <SheetHeader className="flex-shrink-0"><SheetTitle className="text-left">Menú</SheetTitle></SheetHeader>
            <div className="flex-1 overflow-y-auto py-6"><NavigationLinks layout="mobile" onContact={scrollToContact} onNavigate={() => setIsMenuOpen(false)} /></div>
          </SheetContent>
        </Sheet>
      </div>
    </div></div>
  </nav>;
};
