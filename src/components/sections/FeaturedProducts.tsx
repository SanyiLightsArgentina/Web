import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { newProducts } from "@/lib/catalog-query";
import { presentProduct } from "@/lib/product-presentation";
import { useCatalog } from "@/hooks/use-catalog";
import { useRef } from "react";

export const FeaturedProducts = () => {
  const { isMobile } = useIsMobile();
  const { products, isLoaded, error } = useCatalog();
  const featuredProducts = newProducts(products);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-primary font-bold mb-4">
            Descubrí las novedades
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conocé los nuevos equipos de iluminación profesional que sumamos al catálogo.
          </p>
        </div>

        {error ? (
          <p className="text-center text-muted-foreground mb-8">No se pudieron cargar las novedades.</p>
        ) : !isLoaded ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">
              Cargando productos destacados...
            </p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground mb-8">Próximamente vamos a sumar nuevas novedades.</p>
        ) : (
          <>
            {/* Vista móvil: Grid 2x2 simple */}
            {isMobile && (
              <div className="mb-10 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {featuredProducts.map((product, index) => (
                    <div 
                      key={product.model}
                      className="animate-fade-in w-full"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard product={presentProduct(product)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista desktop: Fila horizontal con navegación */}
            {!isMobile && (
              <div className="mb-10 relative">
                {/* Flecha izquierda - posicionada fuera del contenedor */}
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver novedades anteriores"
                  onClick={scrollLeft}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary shadow-lg w-12 h-12 p-0 rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Contenedor de productos con scroll horizontal */}
                <div className="flex gap-6 overflow-x-auto pb-4 px-20" ref={scrollContainerRef}>
                  {featuredProducts.map((product, index) => (
                    <div 
                      key={product.model}
                      className="animate-fade-in flex-shrink-0 w-80"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard product={presentProduct(product)} />
                    </div>
                  ))}
                </div>

                {/* Flecha derecha - posicionada fuera del contenedor */}
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Ver más novedades"
                  onClick={scrollRight}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary shadow-lg w-12 h-12 p-0 rounded-full"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
         
              </div>
            )}
          </>
        )}

        <div className="text-center">
         
          <Link to="/productos" onClick={() => window.scrollTo(0, 0)}>
            <Button size="lg" className="group">
              Ver Todos los Productos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}; 