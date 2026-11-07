import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { getProductsByCategoryId } from "@/lib/product-utils";
import { findProductByModel } from "@/lib/catalog";
import { useCatalog } from "@/hooks/use-catalog";
import { useSEO } from "@/hooks/useSEO";
import {
  ProductHeader,
  ProductTechnicalDescription,
  ProductImageGallery,
  ProductSpecifications,
  ProductVideos,
  RelatedProducts
} from "@/components/product";

const MAX_META_DESCRIPTION_LENGTH = 160;

const ProductDetail = () => {
  const { model } = useParams<{ model: string }>();
  const navigate = useNavigate();
  const { products, isLoaded, error, refetch } = useCatalog();

  const product = findProductByModel(products, model || "");

  const description =
    product?.description?.slice(0, MAX_META_DESCRIPTION_LENGTH).trim() +
    (product?.description && product.description.length > MAX_META_DESCRIPTION_LENGTH ? "…" : "") ||
    `Equipo de iluminación profesional ${product?.model || model}. Cotizá por WhatsApp.`;

  useSEO({
    title: product?.model ?? "Producto",
    description: product ? description : "Producto no encontrado.",
    image: product?.images?.[0] ?? undefined,
    noIndex: !product,
  });

  const relatedProducts = getProductsByCategoryId(products, product?.category_id || 0, 3, product?.model || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [model]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isTransparent={false} />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8 text-center" role="alert">
            <p className="text-muted-foreground mb-4">No se pudo cargar el producto.</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation isTransparent={false} />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">
                Cargando producto...
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
