import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X, Star } from "lucide-react";
import { useState } from "react";
import { applyCatalogQuery, newProducts } from "@/lib/catalog-query";
import { presentProduct } from "@/lib/product-presentation";
import { ProductCard } from "@/components/ui/product-card";
import { useCatalog } from "@/hooks/use-catalog";

export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products, categories } = useCatalog();
  const featuredProducts = newProducts(products, 8);
  const hasQuery = searchQuery.trim() !== "";
  const searchResults = hasQuery ? applyCatalogQuery(products, { text: searchQuery }) : [];

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          aria-label="Buscar productos"
          size="icon" 
          className="relative bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 h-9 w-9 sm:h-10 sm:w-10"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">Buscar Productos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por modelo o descripción..."
              aria-label="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8"
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>

          {/* Mostrar productos destacados cuando no hay búsqueda */}
          {!hasQuery && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Productos Destacados</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredProducts.map((product) => (
                  <div key={product.model} className="w-full">
                    <ProductCard product={presentProduct(product, categories)} onNavigate={() => setOpen(false)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mostrar resultados de búsqueda */}
          {hasQuery && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {searchResults.length} resultados encontrados
                </p>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {searchResults.map((product) => (
                    <div key={product.model} className="w-full">
                      <ProductCard product={presentProduct(product, categories)} onNavigate={() => setOpen(false)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    No se encontraron productos que coincidan con "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
