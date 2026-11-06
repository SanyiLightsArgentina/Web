import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, FolderOpen, Sparkles, X } from 'lucide-react';
import { Product } from '@/data/products';
import { ProductControls } from './ProductControls';
import { ProductCard } from './ProductCard';
import { ProductForm } from '@/components/ui/product-form';
import { useProductsWithCategories } from '@/hooks/use-products-with-categories';

interface ProductsTabProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategoryId: number | null;
  isAddingProduct: boolean;
  editingProduct: Product | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onSaveProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancelForm: () => void;
  onRetry: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  loading,
  error,
  searchTerm,
  selectedCategoryId,
  isAddingProduct,
  editingProduct,
  onSearchChange,
  onCategoryChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSaveProduct,
  onCancelForm,
  onRetry
}) => {
  const { categories, isLoaded } = useProductsWithCategories();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategoryId || product.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Estado de carga general - esperar a que los productos con categorías estén cargados
  const isFullyLoaded = !loading && isLoaded;

  // Mostrar estado de carga inicial hasta que todo esté listo
  if (!isFullyLoaded) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando productos...
          </h3>
          <p className="text-gray-500">
            Obteniendo productos y categorías
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[{ label: 'Productos', value: products.length, icon: Package }, { label: 'Categorías', value: categories.length, icon: FolderOpen }, { label: 'Novedades', value: products.filter(product => product.new).length, icon: Sparkles }].map(stat => <div key={stat.label} className="rounded-2xl border border-border/80 bg-white px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-2 mb-3"><span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span><stat.icon className="hidden sm:block h-4 w-4 text-muted-foreground/60" /></div><p className="text-2xl sm:text-3xl font-semibold tracking-tight">{stat.value}</p></div>)}
      </div>
      {/* Controls */}
      <ProductControls
        searchTerm={searchTerm}
        selectedCategoryId={selectedCategoryId}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onAddProduct={onAddProduct}
      />

      {/* Product Form */}
      {(isAddingProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={onSaveProduct}
          onCancel={onCancelForm}
          loading={loading}
          isAddingProduct={isAddingProduct}
        />
      )}

      <section aria-label="Catálogo de productos" className="overflow-hidden rounded-2xl border border-border/80 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border/70">
          <div className="flex items-center gap-2.5"><h2 className="text-sm font-semibold">Catálogo de productos</h2><span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{filteredProducts.length}</span></div>
          {searchTerm || selectedCategoryId ? <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { onSearchChange(''); onCategoryChange(null); }}><X className="h-3 w-3 mr-1" />Limpiar filtros</Button> : <span className="text-xs text-muted-foreground">{products.length} equipos en tu catálogo</span>}
        </div>
        <div aria-hidden="true" className="hidden md:grid grid-cols-[minmax(0,1fr)_140px_100px] xl:grid-cols-[minmax(0,1fr)_140px_160px_100px] gap-5 px-5 py-3 bg-muted/25 border-b border-border/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Producto</span><span>Categoría</span><span className="hidden xl:block">Archivos</span><span className="text-right">Acciones</span></div>
        <div className="divide-y divide-border/60">
          {filteredProducts.map(product => <ProductCard key={product.id || product.model} product={product} categoryName={categories.find(category => category.id === product.category_id)?.name || 'Sin categoría'} onEdit={() => onEditProduct(product)} onDelete={() => onDeleteProduct(product)} />)}
        </div>
        {filteredProducts.length > 0 && <div className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">Mostrando {filteredProducts.length} de {products.length} productos</div>}
      </section>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategoryId
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay productos en el catálogo'}
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={onRetry} variant="outline" className="mt-2">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
};
