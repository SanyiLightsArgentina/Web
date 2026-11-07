import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { adminSections } from '@/components/admin/admin-sections';
import { ClientsTab } from '@/components/admin/ClientsTab';
import { SiteContentTab } from '@/components/admin/SiteContentTab';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CategoryManager } from '@/components/ui/category-manager';
import { AdminStats } from '@/components/ui/admin-stats';
import { useSEO } from '@/hooks/useSEO';
import { ProductAdminProvider } from '@/hooks/use-product-admin';
import { useAdminSession } from '@/hooks/use-admin-session';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductsTab } from '@/components/admin/ProductsTab';

export default function AdminRoute() {
  useSEO({ title: 'Administración', description: 'Panel de administración', noIndex: true });
  const session = useAdminSession();
  if (session.status === 'loading') return <div role="status" className="min-h-screen grid place-items-center">Cargando sesión...</div>;
  if (session.status === 'signed-out') return <LoginForm onAuthenticate={session.login} loading={session.isLoggingIn} />;
  return <ProductAdminProvider><AdminWorkspace onLogout={session.logout} /></ProductAdminProvider>;
}

function AdminWorkspace({ onLogout }: { onLogout: () => Promise<void> }) {
  const [desktopNavigation, setDesktopNavigation] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktopNavigation(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [activeTab, setActiveTab] = useState('products');
  const activeSection = adminSections.find(section => section.value === activeTab) || adminSections[0];
  return <div className="min-h-screen bg-muted/30">
    <Tabs orientation={desktopNavigation ? 'vertical' : 'horizontal'} value={activeTab} onValueChange={setActiveTab} className="min-h-svh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <AdminNavigation />
      <div className="min-w-0">
        <AdminHeader onLogout={onLogout} section={activeSection.label} />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-7"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{activeSection.label}</h1><p className="text-sm text-muted-foreground">{activeSection.description}</p></div>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="categories" className="space-y-6"><CategoryManager /></TabsContent>
          {(['hero', 'videos', 'contact'] as const).map(section => <TabsContent key={section} value={section}><SiteContentTab section={section} /></TabsContent>)}
          <TabsContent value="clients"><ClientsTab /></TabsContent>
          <TabsContent value="overview" className="space-y-6"><AdminStats /></TabsContent>
        </main>
      </div>
    </Tabs>
  </div>;
}
