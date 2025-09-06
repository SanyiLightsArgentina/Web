import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  productDescription: string;
}

export const ProductImageGallery = ({ images, productDescription }: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      <div className="p-6">
        {/* Imagen principal */}
        <div className="relative mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <img 
              src={images[currentImageIndex]} 
              alt={`${productDescription} - Imagen ${currentImageIndex + 1}`}
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
          {images.length > 1 && (
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
        {images.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Navegar por imágenes:</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
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
    </div>
  );
};
