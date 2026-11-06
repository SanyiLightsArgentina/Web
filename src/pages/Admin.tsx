import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { adminSections } from '@/components/admin/admin-sections';
import { ClientsTab } from '@/components/admin/ClientsTab';
import { SiteContentTab } from '@/components/admin/SiteContentTab';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CategoryManager } from '@/components/ui/category-manager';
import { AdminStats } from '@/components/ui/admin-stats';
import { Product } from '@/data/products';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useProductsWithCategories } from '@/hooks/use-products-with-categories';
import { supabase } from '@/lib/supabase';
import { authenticateUser, getAdminUser } from '@/lib/auth';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { ProductStats } from '@/components/admin/ProductStats';
import { ResponsiveDeleteModal } from "@/components/ui/responsive-delete-modal";

const Admin: React.FC = () => {
  const { toast } = useToast();

  useSEO({
    title: "Administración",
    description: "Panel de administración",
    noIndex: true,
  });

  const [desktopNavigation, setDesktopNavigation] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktopNavigation(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [activeTab, setActiveTab] = useState('products');
  const activeSection = adminSections.find(section => section.value === activeTab) || adminSections[0];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [deleteProductConfirmation, setDeleteProductConfirmation] = useState<Product | null>(null);
  const { 
    products: currentProducts, 
    categories,
    isLoaded: productsLoaded,
    isSaving: productsSaving,
    addProduct: createProduct, 
    updateProduct, 
    deleteProduct,
    loadProductsWithCategories: fetchProducts
  } = useProductsWithCategories();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const admin = getAdminUser(session?.user ?? null);
      setIsAuthenticated(!!admin);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

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
      
      const user = await authenticateUser(username.trim(), password);
      
      if (user && user.role === 'admin') {
        setIsAuthenticated(true);
        setPassword('');
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'No se pudo cerrar la sesión', variant: 'destructive' });
      return;
    }
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    toast({
      title: "Sesión cerrada",
      description: "Sesión cerrada exitosamente"
    });
  };

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    
    // Scroll instantáneo al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.product-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 50);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
    
    // Scroll instantáneo al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.product-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 50);
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
      throw error;
    }
  };

  const handleCancelForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  if (authLoading) return <div role="status" className="min-h-screen grid place-items-center">Cargando sesión...</div>;

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
    <div className="min-h-screen bg-muted/30">
      <Tabs orientation={desktopNavigation ? 'vertical' : 'horizontal'} value={activeTab} onValueChange={setActiveTab} className="min-h-svh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <AdminNavigation />
        <div className="min-w-0">
          <AdminHeader onLogout={handleLogout} section={activeSection.label} />
          <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{activeSection.label}</h1>
              <p className="text-sm text-muted-foreground">{activeSection.description}</p>
            </div>
          <TabsContent value="products">
            <ProductsTab
              products={currentProducts}
              loading={!productsLoaded}
              error={null}
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

          {(['hero', 'videos', 'contact'] as const).map(section => (
            <TabsContent key={section} value={section}><SiteContentTab section={section} /></TabsContent>
          ))}
          <TabsContent value="clients"><ClientsTab /></TabsContent>
          <TabsContent value="overview" className="space-y-6">
            <AdminStats 
              products={currentProducts} 
              categories={categories} 
              isSaving={productsSaving}
              lastSaved={new Date()}
            />
            
            <ProductStats products={currentProducts} />
          </TabsContent>
          </main>
        </div>
      </Tabs>

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
          loading={productsSaving}
        />
      )}
    </div>
  );
};

export default Admin;
