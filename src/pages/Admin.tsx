import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManager } from '@/components/ui/category-manager';
import { AdminStats } from '@/components/ui/admin-stats';
import { useSupabaseCategories } from '@/hooks/use-supabase-categories';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { DatabaseUser } from '@/lib/supabase';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { ProductStats } from '@/components/admin/ProductStats';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResponsiveDeleteModal } from "@/components/ui/responsive-delete-modal";

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<DatabaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [deleteProductConfirmation, setDeleteProductConfirmation] = useState<Product | null>(null);
  const { categories } = useSupabaseCategories();
  const { 
    products: currentProducts, 
    loading: productsLoading,
    error: productsError,
    createProduct, 
    updateProduct, 
    deleteProduct,
    fetchProducts
  } = useProducts();

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!username.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "❌ Por favor ingresa el nombre de usuario"
        });
        return;
      }
      
      if (!password.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "❌ Por favor ingresa la contraseña"
        });
        return;
      }
      
      setIsLoggingIn(true);
      
      const { authenticateUser } = await import('@/lib/supabase');
      
      const user = await authenticateUser(username.trim(), password);
      
      if (user && user.role === 'admin') {
        setCurrentUser(user);
        setIsAuthenticated(true);
        toast({
          title: "¡Bienvenido!",
          description: `✅ ¡Bienvenido ${user.username}!`
        });
      } else if (user && user.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "❌ Solo administradores pueden acceder."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "❌ Error inesperado en la autenticación"
        });
      }
      
    } catch (error) {
      console.error('🚨 Error en login:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Mensaje de error genérico para no revelar información específica
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "❌ Usuario o contraseña incorrectos. Verifica tus credenciales."
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setCurrentUser(null);
    toast({
      title: "Sesión cerrada",
      description: "Sesión cerrada exitosamente"
    });
  };

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    
    // Hacer scroll hacia arriba para mostrar el formulario
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
    
    // Hacer scroll hacia arriba para mostrar el formulario
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDeleteProduct = async (productToDelete: Product) => {
    setDeleteProductConfirmation(productToDelete);
  };

  const confirmDeleteProduct = async () => {
    if (deleteProductConfirmation) {
      try {
        if (deleteProductConfirmation.id) {
          await deleteProduct(deleteProductConfirmation.id);
          toast({
            title: "Éxito",
            description: `🗑️ Producto "${deleteProductConfirmation.model}" eliminado exitosamente`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se puede eliminar el producto: ID no encontrado"
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Error eliminando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`
        });
      } finally {
        setDeleteProductConfirmation(null);
      }
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteProductConfirmation(null);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'created_at' | 'updated_at'> & { id?: number }) => {
    try {
      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, productData);
        setEditingProduct(null);
        toast({
          title: "Éxito",
          description: `🔄 Producto "${productData.model}" actualizado exitosamente`
        });
      } else {
        await createProduct(productData);
        setIsAddingProduct(false);
        toast({
          title: "Éxito",
          description: `✅ Producto "${productData.model}" agregado exitosamente`
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `❌ Error guardando producto: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    }
  };

  const handleCancelForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        username={username}
        password={password}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        loading={isLoggingIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab
              products={currentProducts}
              loading={productsLoading}
              error={productsError}
              searchTerm={searchTerm}
              selectedCategoryId={selectedCategoryId}
              isAddingProduct={isAddingProduct}
              editingProduct={editingProduct}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategoryId}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onSaveProduct={handleSaveProduct}
              onCancelForm={handleCancelForm}
              onRetry={fetchProducts}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManager
              onCategoryChange={(newCategories) => {
                toast({
                  title: "Éxito",
                  description: "Categorías actualizadas"
                });
              }}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats 
              products={currentProducts} 
              categories={categories} 
              isSaving={productsLoading}
              lastSaved={new Date()}
            />
            
            <ProductStats products={currentProducts} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de confirmación para eliminar producto */}
      {deleteProductConfirmation && (
        <ResponsiveDeleteModal
          isOpen={!!deleteProductConfirmation}
          onClose={() => setDeleteProductConfirmation(null)}
          onConfirm={confirmDeleteProduct}
          title="Confirmar eliminación"
          description="¿Estás seguro de que quieres eliminar el producto"
          itemName={deleteProductConfirmation.model}
          itemType="producto"
          confirmText="Eliminar Producto"
          loading={productsLoading}
        />
      )}
    </div>
  );
};

export default Admin;
