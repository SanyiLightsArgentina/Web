import { productImageUrl } from '@/lib/product-images';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from '@/hooks/use-carousel';

interface ProductImageGalleryProps {
  images: string[];
  productDescription: string;
}

export const ProductImageGallery = ({ images, productDescription }: ProductImageGalleryProps) => {
  const { index: currentImageIndex, next: nextImage, previous: prevImage, goTo: goToImage } = useCarousel(images.length);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      <div className="p-6">
        {/* Imagen principal */}
        <div className="relative mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <img 
              src={productImageUrl(images[currentImageIndex], 'detail')}
              alt={`${productDescription} - Imagen ${currentImageIndex + 1}`}
              className="w-full h-[250px] sm:h-[280px] object-contain mx-auto"
            />
          </div>
          
          {/* Botones de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={prevImage}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextImage}
                aria-label="Imagen siguiente"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-gray-200 h-8 w-8 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails de navegación */}
        {images.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Navegar por imágenes:</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-current={index === currentImageIndex}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    index === currentImageIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={productImageUrl(image, 'thumb')}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
