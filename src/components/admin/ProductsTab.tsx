import React from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { Product } from '@/data/products';
import { ProductControls } from './ProductControls';
import { ProductCard } from './ProductCard';
import { ProductForm } from '@/components/ui/product-form';
import { useSupabaseCategories } from '@/hooks/use-supabase-categories';

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
  const { categories } = useSupabaseCategories();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategoryId || product.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
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
          onSubmit={onSaveProduct}
          onCancel={onCancelForm}
          loading={loading}
          isAddingProduct={isAddingProduct}
        />
      )}

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id || product.model}
            product={product}
            onEdit={() => onEditProduct(product)}
            onDelete={() => onDeleteProduct(product)}
          />
        ))}
      </div>

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
