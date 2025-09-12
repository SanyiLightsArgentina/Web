import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { Category, useSupabaseCategories } from '@/hooks/use-supabase-categories';
import { toast } from 'sonner';
import { ResponsiveDeleteModal } from "./responsive-delete-modal";

interface CategoryManagerProps {
  onCategoryChange: (categories: Category[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryChange }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useSupabaseCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Category | null>(null);

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await addCategory(newCategoryName.trim());
        setNewCategoryName('');
        setIsAddingCategory(false);
        onCategoryChange(categories);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const handleEditCategory = async (oldCategory: Category, newName: string) => {
    if (newName.trim() && newName.trim() !== oldCategory.name) {
      try {
        await updateCategory(oldCategory.id, newName.trim());
        setEditingCategory(null);
        onCategoryChange(categories);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const handleDeleteCategory = (categoryToDelete: Category) => {
    setDeleteConfirmation(categoryToDelete);
  };

  const confirmDeleteCategory = async () => {
    if (deleteConfirmation) {
      try {
        await deleteCategory(deleteConfirmation.id);
        onCategoryChange(categories);
        setDeleteConfirmation(null);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Categorías</CardTitle>
          <Button
            onClick={() => setIsAddingCategory(true)}
            size="sm"
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agregar nueva categoría */}
        {isAddingCategory && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Input
              placeholder="Nombre de la nueva categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button
              onClick={handleAddCategory}
              size="sm"
              className="h-8 px-3"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName('');
              }}
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Lista de categorías */}
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
            >
              {editingCategory === category ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    value={category.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      if (newName.trim()) {
                        handleEditCategory(category, newName);
                      }
                    }}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category, e.currentTarget.value)}
                    onBlur={() => handleEditCategory(category, category.name)}
                    autoFocus
                  />
                  <Button
                    onClick={() => handleEditCategory(category, category.name)}
                    size="sm"
                    className="h-8 px-3"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => startEditing(category)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCategory(category)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>No hay categorías definidas</p>
            <p className="text-sm">Agrega tu primera categoría para empezar</p>
          </div>
        )}

        {/* Modal de confirmación para eliminar categoría */}
        {deleteConfirmation && (
          <ResponsiveDeleteModal
            isOpen={!!deleteConfirmation}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={confirmDeleteCategory}
            title="Confirmar eliminación"
            description="¿Estás seguro de que quieres eliminar la categoría"
            itemName={deleteConfirmation.name}
            itemType="categoría"
            confirmText="Eliminar Categoría"
          />
        )}
      </CardContent>
    </Card>
  );
};
