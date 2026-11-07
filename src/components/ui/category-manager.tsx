import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Plus, Edit, Trash2, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { useCategoryAdmin } from '@/hooks/use-category-admin';
import { ResponsiveDeleteModal } from "./responsive-delete-modal";

export const CategoryManager: React.FC = () => {
  const {
    categories, isLoaded, error, retry, busy, editingCategory, editingName, setEditingName,
    newCategoryName, setNewCategoryName, isAddingCategory, deleteConfirmation,
    startAdding, cancelAdding, startEditing, cancelEditing, handleAddCategory,
    handleEditCategory, handleDeleteCategory, cancelDeleteCategory, confirmDeleteCategory, moveCategory,
  } = useCategoryAdmin();

  if (error) return <div role="alert">No se pudieron cargar las categorías. <Button onClick={retry}>Reintentar</Button></div>;
  if (!isLoaded) return <p role="status">Cargando categorías...</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Categorías</CardTitle>
          <Button
            onClick={startAdding}
            disabled={busy}
            size="sm"
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset disabled={busy} className="flex flex-col gap-4">
        {/* Agregar nueva categoría */}
        {isAddingCategory && (
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Input
              placeholder="Nombre de la nueva categoría"
              aria-label="Nombre de la nueva categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleAddCategory(); } }}
            />
            <Button
              onClick={handleAddCategory}
              aria-label="Guardar nueva categoría"
              size="sm"
              className="h-8 px-3"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={cancelAdding}
              aria-label="Cancelar nueva categoría"
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
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
            >
              {editingCategory?.id === category.id ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    aria-label="Nombre de la categoría"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleEditCategory(); } }}
                    autoFocus
                  />
                  <Button
                    onClick={handleEditCategory}
                    aria-label="Guardar categoría"
                    size="sm"
                    className="h-8 px-3"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    aria-label="Cancelar edición"
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
                    <Button variant="outline" size="icon" aria-label={`Subir ${category.name}`} disabled={index === 0} onClick={() => moveCategory(index, -1)}><ArrowUp data-icon="inline-start" /></Button>
                    <Button variant="outline" size="icon" aria-label={`Bajar ${category.name}`} disabled={index === categories.length - 1} onClick={() => moveCategory(index, 1)}><ArrowDown data-icon="inline-start" /></Button>
                    <Button
                      onClick={() => startEditing(category)}
                      aria-label={`Editar ${category.name}`}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCategory(category)}
                      aria-label={`Eliminar ${category.name}`}
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

        </fieldset>
        {/* Modal de confirmación para eliminar categoría */}
        {deleteConfirmation && (
          <ResponsiveDeleteModal
            isOpen={!!deleteConfirmation}
            onClose={cancelDeleteCategory}
            onConfirm={confirmDeleteCategory}
            title="Confirmar eliminación"
            description="¿Estás seguro de que quieres eliminar la categoría"
            itemName={deleteConfirmation.name}
            itemType="categoría"
            confirmText="Eliminar Categoría"
            loading={busy}
          />
        )}
      </CardContent>
    </Card>
  );
};
