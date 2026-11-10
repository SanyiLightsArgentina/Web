import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Package, FolderOpen, Sparkles, X } from 'lucide-react';
import { ProductControls } from './ProductControls';
import { ProductCard } from './ProductCard';
import { ProductForm } from '@/components/ui/product-form';
import { presentProduct } from '@/lib/product-presentation';
import { useProductAdmin } from '@/hooks/use-product-admin';
import { ResponsiveDeleteModal } from '@/components/ui/responsive-delete-modal';

export const ProductsTab = () => {
  const {
  categories,
  summary,
  visibleProducts,
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
  onRetry, isSaving, deleteProductConfirmation, cancelDeleteProduct, confirmDeleteProduct,
  } = useProductAdmin();
  const form = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isAddingProduct || editingProduct) form.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [isAddingProduct, editingProduct]);

  if (loading) {
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
        {[{ label: 'Productos', value: summary.totalProducts, icon: Package }, { label: 'Categorías', value: summary.categoryStats.length, icon: FolderOpen }, { label: 'Novedades', value: summary.newProducts, icon: Sparkles }].map(stat => <div key={stat.label} className="rounded-2xl border border-border/80 bg-white px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-2 mb-3"><span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span><stat.icon className="hidden sm:block h-4 w-4 text-muted-foreground/60" /></div><p className="text-2xl sm:text-3xl font-semibold tracking-tight">{stat.value}</p></div>)}
      </div>
      {/* Controls */}
      <ProductControls
        categories={categories}
        searchTerm={searchTerm}
        selectedCategoryId={selectedCategoryId}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onAddProduct={onAddProduct}
      />

      {/* Product Form */}
      {(isAddingProduct || editingProduct) && (
        <div ref={form}><ProductForm
          key={editingProduct?.id ?? editingProduct?.model ?? 'new'}
          product={editingProduct ?? undefined}
          categories={categories}
          onSubmit={onSaveProduct}
          onCancel={onCancelForm}
          loading={isSaving}
        /></div>
      )}

      <section aria-label="Catálogo de productos" className="overflow-hidden rounded-2xl border border-border/80 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-border/70">
          <div className="flex items-center gap-2.5"><h2 className="text-sm font-semibold">Catálogo de productos</h2><span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{visibleProducts.length}</span></div>
          {searchTerm || selectedCategoryId ? <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { onSearchChange(''); onCategoryChange(null); }}><X className="h-3 w-3 mr-1" />Limpiar filtros</Button> : <span className="text-xs text-muted-foreground">{summary.totalProducts} equipos en tu catálogo</span>}
        </div>
        <div aria-hidden="true" className="hidden md:grid grid-cols-[minmax(0,1fr)_140px_100px] xl:grid-cols-[minmax(0,1fr)_140px_160px_100px] gap-5 px-5 py-3 bg-muted/25 border-b border-border/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Producto</span><span>Categoría</span><span className="hidden xl:block">Archivos</span><span className="text-right">Acciones</span></div>
        <div className="divide-y divide-border/60">
          {visibleProducts.map(product => <ProductCard key={product.id || product.model} presentation={presentProduct(product)} onEdit={() => onEditProduct(product)} onDelete={() => onDeleteProduct(product)} />)}
        </div>
        {visibleProducts.length > 0 && <div className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">Mostrando {visibleProducts.length} de {summary.totalProducts} productos</div>}
      </section>

      {visibleProducts.length === 0 && !error && (
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

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={onRetry} variant="outline" className="mt-2">
            Reintentar
          </Button>
        </div>
      )}
      {deleteProductConfirmation && <ResponsiveDeleteModal isOpen onClose={cancelDeleteProduct} onConfirm={confirmDeleteProduct} title="Confirmar eliminación" description="¿Estás seguro de que quieres eliminar el producto" itemName={deleteProductConfirmation.model} itemType="producto" confirmText="Eliminar Producto" loading={isSaving} />}
    </div>
  );
};
