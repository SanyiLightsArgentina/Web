import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Footer } from "@/components/sections/Footer";
import { getProductByModel, getProductsByCategory } from "@/lib/product-utils";
import { Product } from "@/data/products";
import { useQuoteList } from "@/hooks/use-quote-list";
import { openWhatsAppForModel, openWhatsAppForModels } from "@/lib/contact";
import { ProductCard } from "@/components/ui/product-card";
import { useSupabaseProducts } from "@/hooks/use-supabase-products";

const ProductDetail = () => {
  const { model } = useParams<{ model: string }>();
  const navigate = useNavigate();
  const { products, isLoaded } = useSupabaseProducts();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const product: Product | undefined = getProductByModel(products, model || "");
  
  const { add, has, toggle, items } = useQuoteList();

  const relatedProducts = getProductsByCategory(products, product?.category || "", 3, product?.model || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Resetear índices cuando cambie el producto
  useEffect(() => {
    setCurrentImageIndex(0);
    setCurrentContentIndex(0);
  }, [product?.model]);

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYouTubeVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isPdfFile = (url: string) => {
    try {
      return url.toLowerCase().trim().split('?')[0].endsWith('.pdf');
    } catch {
      return false;
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const nextContent = () => {
    if (product?.contents && product.contents.length > 0) {
      setCurrentContentIndex((prev) => (prev + 1) % product.contents.length);
    }
  };

  const prevContent = () => {
    if (product?.contents && product.contents.length > 0) {
      setCurrentContentIndex((prev) => (prev - 1 + product.contents.length) % product.contents.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const goToContent = (index: number) => {
    setCurrentContentIndex(index);
  };

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

  const videoId = getYouTubeVideoId(product.videos?.[0] || "");

  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <Link 
              to="/productos" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Productos
            </Link>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.model}</h1>
            <p className="text-lg text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => openWhatsAppForModel(product.model)}
            >
              Cotizar por WhatsApp
            </Button>
            <Button
              size="lg"
              variant={has(product.model) ? "secondary" : "default"}
              onClick={() => toggle(product.model)}
            >
              {has(product.model) ? "Quitar de lista" : "Agregar a lista"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Columna izquierda - Imágenes del producto (más pequeña) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Galería de Imágenes
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Visualiza el producto desde diferentes ángulos</p>
                </div>
                
                {product.images && product.images.length > 0 && (
                  <div className="p-4">
                    {/* Imagen principal */}
                    <div className="relative mb-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <img 
                          src={product.images[currentImageIndex]} 
                          alt={`${product.description} - Imagen ${currentImageIndex + 1}`}
                          className="w-full h-[250px] sm:h-[280px] object-contain mx-auto"
                          style={{
                            imageRendering: 'crisp-edges',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            filter: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Botones de navegación */}
                      {product.images.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200 h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200 h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails de navegación */}
                    {product.images.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-medium">Navegar por imágenes:</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {product.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                index === currentImageIndex 
                                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha - Especificaciones del producto (más grande) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-8 bg-green-500 rounded-full"></span>
                    Especificaciones Técnicas
                  </h2>
                  <p className="text-gray-600 mt-2">Detalles técnicos y características del producto</p>
                </div>
                
                {product.contents && product.contents.length > 0 && (
                  <div className="p-6">
                    {/* Contenido principal */}
                    <div className="relative mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        {isPdfFile(product.contents[currentContentIndex]) ? (
                          <div className="w-full h-[500px] sm:h-[550px] flex flex-col gap-3">
                            <iframe
                              src={`${product.contents[currentContentIndex]}#toolbar=1&navpanes=0`}
                              title={`PDF de ${product.model}`}
                              className="w-full h-full rounded"
                            />
                            <div className="text-center">
                              <a
                                href={product.contents[currentContentIndex]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                download
                              >
                                Descargar PDF
                              </a>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={product.contents[currentContentIndex]} 
                            alt={`${product.description} - Especificaciones ${currentContentIndex + 1}`}
                            className="w-full h-[500px] sm:h-[550px] object-contain mx-auto"
                            style={{
                              imageRendering: 'crisp-edges',
                              border: 'none',
                              outline: 'none',
                              boxShadow: 'none',
                              filter: 'none'
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Botones de navegación */}
                      {product.contents.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevContent}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextContent}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails de navegación */}
                    {product.contents.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 font-medium">Navegar por especificaciones:</p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {product.contents.map((content, index) => (
                            <button
                              key={index}
                              onClick={() => goToContent(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                index === currentContentIndex 
                                  ? 'border-green-500 ring-2 ring-green-200 shadow-lg' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {isPdfFile(content) ? (
                                <div className="w-full h-full flex items-center justify-center bg-white text-xs font-semibold text-gray-700">
                                  PDF
                                </div>
                              ) : (
                                <img
                                  src={content}
                                  alt={`Especificación ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Videos */}
          {product.videos && product.videos.length > 0 && (
            <div className="mt-12">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-8 bg-purple-500 rounded-full"></span>
                    Videos del Producto
                  </h2>
                  <p className="text-gray-600 mt-2">Conoce más sobre {product.model} a través de nuestros videos</p>
                </div>
                
                <div className="p-6">
                  <div className={`grid gap-6 ${
                    product.videos.length === 1 
                      ? 'grid-cols-1 max-w-2xl mx-auto' 
                      : 'grid-cols-1 lg:grid-cols-2'
                  }`}>
                    {product.videos.map((video, index) => {
                      const videoId = getYouTubeVideoId(video);
                      const isYouTube = isYouTubeVideo(video);
                      
                      return (
                        <div key={index} className="space-y-3">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-4 bg-purple-400 rounded-full"></span>
                            {product.videos.length > 1 ? `Video ${index + 1}` : 'Video del Producto'}
                          </h3>
                          <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                            {isYouTube ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={`Video ${index + 1} de ${product.model}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={video}
                                controls
                                className="w-full h-full object-cover"
                                preload="metadata"
                              >
                                Tu navegador no soporta el elemento de video.
                              </video>
                            )}
                          </div>
                          {product.videos.length > 1 && (
                            <p className="text-sm text-gray-600 text-center">
                              Video {index + 1} de {product.videos.length}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Productos Relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">Productos Relacionados</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Descubre otros productos de la misma categoría que podrían interesarte
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.model} className="flex justify-center">
                    <div className="w-full max-w-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <ProductCard {...relatedProduct} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail; 