import { Navigation } from "@/components/ui/navigation";
import { ProductCard } from "@/components/ui/product-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { filterProducts } from "@/lib/product-utils";
import { useSupabaseProducts } from "@/hooks/use-supabase-products";
import { useSupabaseCategories } from "@/hooks/use-supabase-categories";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Products = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Usar productos y categorías desde Supabase
  const { products, isLoaded } = useSupabaseProducts();
  const { categories } = useSupabaseCategories();
  
  // Configuración de paginación
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredProducts = filterProducts(products, searchQuery, selectedCategory, showOnlyNew);
  
  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  
  // Resetear a la primera página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, showOnlyNew]);
  
  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("Todos");
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Nuestros Productos</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Equipos de iluminación profesional para todos tus eventos
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-md bg-white focus:border-red-600 focus:ring-red-500 shadow-lg h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            
            {/* Filtro de productos nuevos */}
            <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Switch
                id="new-products"
                checked={showOnlyNew}
                onCheckedChange={setShowOnlyNew}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
              />
              <Label htmlFor="new-products" className="text-sm font-medium text-gray-700 cursor-pointer">
                Solo productos nuevos
              </Label>
              {showOnlyNew && (
                <Badge variant="secondary" className="text-xs">
                  Activo
                </Badge>
              )}
            </div>
            
            {/* Chips de categorías */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === "Todos" ? "default" : "secondary"}
                className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                  selectedCategory === "Todos" ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => handleCategorySelect("Todos")}
              >
                Todos
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.name ? "default" : "secondary"}
                  className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                    selectedCategory === category.name ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => handleCategorySelect(category.name)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="text-sm sm:text-base text-muted-foreground">
              {isLoaded ? (
                <>
                  {filteredProducts.length} productos encontrados
                  {selectedCategory && selectedCategory !== "Todos" && (
                    <span className="ml-2">
                      en <Badge variant="secondary" className="text-xs sm:text-sm">{selectedCategory}</Badge>
                    </span>
                  )}
                  {showOnlyNew && (
                    <span className="ml-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm">Solo nuevos</Badge>
                    </span>
                  )}
                  {totalPages > 1 && (
                    <span className="ml-2">
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        Página {currentPage} de {totalPages}
                      </Badge>
                    </span>
                  )}
                </>
              ) : (
                'Cargando productos...'
              )}
            </div>
          </div>

          {!isLoaded ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-base sm:text-lg">
                Cargando productos...
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentProducts.map((product) => (
                  <div key={product.model} className="w-full">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-muted-foreground text-base sm:text-lg">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </p>
                </div>
              )}

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNumber)}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;