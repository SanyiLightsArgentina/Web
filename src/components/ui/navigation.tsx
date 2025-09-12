import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SearchDialog } from "./search-dialog";
import { useSupabaseCategories } from "@/hooks/use-supabase-categories";
import logo from "/src/assets/logo.png";
import { useQuoteList } from "@/hooks/use-quote-list";
import { openWhatsAppForModels } from "@/lib/contact";
import { useSupabaseProducts } from "@/hooks/use-supabase-products";

interface NavigationProps {
  isTransparent?: boolean;
}

export const Navigation = ({ isTransparent = false }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { items, remove, clear } = useQuoteList();
  const { products } = useSupabaseProducts();
  const { categories } = useSupabaseCategories();

  useEffect(() => {
    if (!isTransparent) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleCategorySelect = (category: string) => {
    navigate('/productos', { 
      state: { selectedCategory: category } 
    });
  };

  // Función para determinar si un enlace está activo
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg">
              <img 
                src={logo}
                alt="Sanyi Lights Argentina" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-white">
                Sanyi Lights
              </span>
              <span className="text-sm opacity-90 ml-2 text-white">
                Argentina
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-all duration-300 px-4 py-2 rounded-md ${
                isActiveLink('/') 
                  ? 'bg-primary text-white' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Inicio
            </Link>
            
            <div className="group relative">
              <Button
                variant="ghost"
                className={`transition-all duration-300 px-4 py-2 rounded-md flex items-center gap-1 ${
                  isActiveLink('/productos') 
                    ? 'bg-primary text-white' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Productos
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {/* Dropdown que aparece con hover */}
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.name)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <Link 
              to="/about" 
              className={`transition-all duration-300 px-4 py-2 rounded-md ${
                isActiveLink('/about') 
                  ? 'bg-primary text-white' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Sobre Nosotros
            </Link>
            
            <Link 
              to="/videos" 
              className={`transition-all duration-300 px-4 py-2 rounded-md ${
                isActiveLink('/videos') 
                  ? 'bg-primary text-white' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Videos
            </Link>
            
            <a 
              href="#contacto" 
              onClick={scrollToContact}
              className="transition-all duration-300 px-4 py-2 rounded-md text-white hover:bg-white/20"
            >
              Contacto
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <SearchDialog />
            <>
              <Button
                variant="default"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => setIsQuoteOpen(true)}
              >
                Cotizar lista ({items.length})
              </Button>
              <Sheet open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
                <SheetContent side="right" className="w-[360px] sm:w-[420px] flex flex-col">
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle className="text-left">Lista de cotización</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {items.map((model) => {
                      const product = products.find(p => p.model === model);
                      return (
                        <div
                          key={model}
                          className="flex items-center gap-3 p-3 rounded-md border bg-background"
                        >
                          <img
                            src={product?.images?.[0] || ''}
                            alt={product?.description || model}
                            className="w-16 h-16 rounded object-contain bg-muted"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.visibility = 'hidden';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product?.model || model}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {product?.description || 'Producto' }
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(model)}
                            aria-label={`Quitar ${model}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-sm text-muted-foreground">No hay productos en la lista.</div>
                    )}
                  </div>
                  <div className="flex-shrink-0 space-y-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          openWhatsAppForModels(items);
                          setIsQuoteOpen(false);
                        }}
                        disabled={items.length === 0}
                      >
                        Enviar por WhatsApp
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => clear()}
                        disabled={items.length === 0}
                      >
                        Vaciar
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden transition-all duration-300 text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle className="text-left">Menú</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-6">
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/"
                      className={`flex items-center px-3 py-2 text-lg font-medium rounded-md transition-colors ${
                        isActiveLink('/') 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inicio
                    </Link>
                    <div className="space-y-2">
                      <div className={`px-3 py-2 text-lg font-medium ${
                        isActiveLink('/productos') 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`}>
                        Productos
                      </div>
                      <div className="space-y-1">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              handleCategorySelect(category.name);
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center px-6 py-2 text-base hover:bg-muted rounded-md transition-colors w-full text-left"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link
                      to="/about"
                      className={`flex items-center px-3 py-2 text-lg font-medium rounded-md transition-colors ${
                        isActiveLink('/about') 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sobre Nosotros
                    </Link>
                    <Link
                      to="/videos"
                      className={`flex items-center px-3 py-2 text-lg font-medium rounded-md transition-colors ${
                        isActiveLink('/videos') 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Videos
                    </Link>
                    <a
                      href="#contacto"
                      onClick={(e) => {
                        scrollToContact(e);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 text-lg font-medium hover:bg-muted rounded-md transition-colors"
                    >
                      Contacto
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};