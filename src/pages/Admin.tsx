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
import { useCatalog } from '@/hooks/use-catalog';
import { useCatalogWrites } from '@/hooks/use-catalog-writes';
import { useAdminSession } from '@/hooks/use-admin-session';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { ProductStats } from '@/components/admin/ProductStats';
import { ResponsiveDeleteModal } from "@/components/ui/responsive-delete-modal";

const AdminRoute: React.FC = () => {
  useSEO({
    title: "Administración",
    description: "Panel de administración",
    noIndex: true,
  });

  const session = useAdminSession();

  if (session.status === 'loading') {
    return <div role="status" className="min-h-screen grid place-items-center">Cargando sesión...</div>;
  }

  if (session.status === 'signed-out') {
    return <LoginForm onAuthenticate={session.login} loading={session.isLoggingIn} />;
  }

  return <AdminWorkspace onLogout={session.logout} />;
};

const AdminWorkspace: React.FC<{ onLogout: () => Promise<void> }> = ({ onLogout }) => {
  const { toast } = useToast();

  const [desktopNavigation, setDesktopNavigation] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktopNavigation(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [activeTab, setActiveTab] = useState('products');
  const activeSection = adminSections.find(section => section.value === activeTab) || adminSections[0];

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [deleteProductConfirmation, setDeleteProductConfirmation] = useState<Product | null>(null);
  const {
    products: currentProducts,
    categories,
    isLoaded: productsLoaded,
    error: productsError,
    refetch: fetchProducts,
  } = useCatalog();
  const {
    isSaving: productsSaving,
    lastSaved,
    addProduct: createProduct,
    updateProduct,
    deleteProduct,
  } = useCatalogWrites();

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);

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
          await deleteProduct(deleteProductConfirmation.id, deleteProductConfirmation.model);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se puede eliminar el producto: ID no encontrado"
          });
        }
      } catch {
        // The catalog write module reports the error.
      } finally {
        setDeleteProductConfirmation(null);
      }
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteProductConfirmation(null);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'created_at' | 'updated_at'> & { id?: number }) => {
    if (editingProduct && editingProduct.id) {
      await updateProduct(editingProduct.id, productData, productData.model);
      setEditingProduct(null);
    } else {
      await createProduct(productData);
      setIsAddingProduct(false);
    }
  };

  const handleCancelForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Tabs orientation={desktopNavigation ? 'vertical' : 'horizontal'} value={activeTab} onValueChange={setActiveTab} className="min-h-svh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
        <AdminNavigation />
        <div className="min-w-0">
          <AdminHeader onLogout={onLogout} section={activeSection.label} />
          <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{activeSection.label}</h1>
              <p className="text-sm text-muted-foreground">{activeSection.description}</p>
            </div>
          <TabsContent value="products">
            <ProductsTab
              products={currentProducts}
              categories={categories}
              loading={!productsLoaded}
              error={productsError?.message ?? null}
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
            <CategoryManager onCategoryChange={() => undefined} />
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
              lastSaved={lastSaved}
            />

            <ProductStats products={currentProducts} />
          </TabsContent>
          </main>
        </div>
      </Tabs>

      {deleteProductConfirmation && (
        <ResponsiveDeleteModal
          isOpen={!!deleteProductConfirmation}
          onClose={cancelDeleteProduct}
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

export default AdminRoute;
