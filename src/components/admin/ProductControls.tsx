import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useProductsWithCategories } from '@/hooks/use-products-with-categories';

interface ProductControlsProps {
  searchTerm: string;
  selectedCategoryId: number | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onAddProduct: () => void;
}

export const ProductControls: React.FC<ProductControlsProps> = ({
  searchTerm,
  selectedCategoryId,
  onSearchChange,
  onCategoryChange,
  onAddProduct
}) => {
  const { categories } = useProductsWithCategories();
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">
            Todas las categorías
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={onAddProduct} className="whitespace-nowrap">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Producto
      </Button>
    </div>
  );
};
