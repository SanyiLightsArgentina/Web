import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Package, TrendingUp, Eye, Star, BarChart3, Users, ShoppingCart } from 'lucide-react';
import { useProductAdmin } from '@/hooks/use-product-admin';
import { useAdminWrite } from '@/hooks/use-admin-write';
import { summarizeCatalog } from '@/lib/catalog-stats';

export const AdminStats: React.FC = () => {
  const { products, categories } = useProductAdmin();
  const { isSaving, lastSaved } = useAdminWrite();
  const {
    totalProducts,
    newProducts,
    productsWithVideo,
    productsWithSecondaryImage,
    productsWithMultipleImages,
    describedProducts,
    productsWithPrimaryImage,
    productsWithContent,
    categoryStats,
  } = summarizeCatalog(products, categories);

  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              En el catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Nuevos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newProducts}</div>
            <p className="text-xs text-muted-foreground">
              {totalProducts > 0 ? `${((newProducts / totalProducts) * 100).toFixed(1)}%` : '0%'} del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Video</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithVideo}</div>
            <p className="text-xs text-muted-foreground">
              {totalProducts > 0 ? `${((productsWithVideo / totalProducts) * 100).toFixed(1)}%` : '0%'} del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Guardado</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : lastSaved ? (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              ) : (
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {isSaving ? (
                <span className="text-blue-600">Guardando...</span>
              ) : lastSaved ? (
                <span className="text-green-600">
                  Guardado: {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span className="text-gray-600">No guardado</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSaving ? 'Procesando cambios...' : lastSaved ? 'Última actualización' : 'Sin cambios recientes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-muted-foreground">
                    {stat.count} productos ({stat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProducts.map((product, index) => (
              <div key={product.model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.model}</p>
                    <p className="text-sm text-gray-600">
                      {product.category_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {product.new && (
                    <Badge variant="secondary" className="text-xs">
                      Nuevo
                    </Badge>
                  )}
                  {product.videos && product.videos.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Video
                    </Badge>
                  )}
                  {product.contents && product.contents.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      +1 Img
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de calidad */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Calidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Completitud de Información</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Con descripción</span>
                  <span className="text-green-600 font-medium">
                    {describedProducts}/{totalProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Con imagen principal</span>
                  <span className="text-green-600 font-medium">
                    {productsWithPrimaryImage}/{totalProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Con imagen de contenido</span>
                  <span className="text-green-600 font-medium">
                    {productsWithContent}/{totalProducts}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Características Adicionales</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Con video</span>
                  <span className="text-blue-600 font-medium">
                    {productsWithVideo}/{totalProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Con imagen secundaria</span>
                  <span className="text-blue-600 font-medium">
                    {productsWithSecondaryImage}/{totalProducts}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Marcados como nuevos</span>
                  <span className="text-orange-600 font-medium">
                    {newProducts}/{totalProducts}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Estadísticas de Productos</CardTitle><CardDescription>Información sobre la estructura de productos</CardDescription></CardHeader>
        <CardContent className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{productsWithMultipleImages}</div><div className="text-sm text-blue-600">Productos con múltiples imágenes</div></div>
          <div className="text-center p-4 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{productsWithVideo}</div><div className="text-sm text-green-600">Productos con videos</div></div>
          <div className="text-center p-4 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{productsWithSecondaryImage}</div><div className="text-sm text-purple-600">Productos con múltiples contenidos</div></div>
        </div></CardContent>
      </Card>
    </div>
  );
};
