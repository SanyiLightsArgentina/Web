import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { getProductByModel, getProductsByCategoryId } from "@/lib/product-utils";
import { useProductsWithCategories } from "@/hooks/use-products-with-categories";
import { Product } from "@/data/products";
import {
  ProductHeader,
  ProductTechnicalDescription,
  ProductImageGallery,
  ProductSpecifications,
  ProductVideos,
  RelatedProducts
} from "@/components/product";

const ProductDetail = () => {
  const { model } = useParams<{ model: string }>();
  const navigate = useNavigate();
  const { products, isLoaded } = useProductsWithCategories();

  const product = getProductByModel(products, model || "");
  
  // Helper function to get category name
  const getCategoryName = (product: Product & { category_name?: string; category?: string }) => {
    return product?.category_name || product?.category || '';
  };
  
  const relatedProducts = getProductsByCategoryId(products, product?.category_id || 0, 3, product?.model || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isLoaded || !products || products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isTransparent={false} />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">
                {!isLoaded ? 'Cargando producto...' : 'Cargando productos...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isTransparent={false} />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
              <p className="text-muted-foreground mb-4">
                El producto "{model}" no esta disponible.
              </p>
              <Button onClick={() => navigate('/productos')}>
                Volver a Productos
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <ProductHeader product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Columna izquierda - Imágenes del producto */}
            <div className="lg:col-span-1 space-y-6">
              <ProductImageGallery 
                images={product.images || []} 
                productDescription={product.description} 
              />
              <ProductSpecifications 
                contents={product.contents || []} 
                productDescription={product.description} 
              />
            </div>

            {/* Columna derecha - Descripción Técnica */}
            <div className="lg:col-span-2 space-y-6">
              <ProductTechnicalDescription technical_description={product.technical_description || ''} />
            </div>
          </div>

          <ProductVideos 
            videos={product.videos || []} 
            productModel={product.model} 
          />

          <RelatedProducts relatedProducts={relatedProducts} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail; 