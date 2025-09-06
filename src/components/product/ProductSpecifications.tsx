import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductSpecificationsProps {
  contents: string[];
  productDescription: string;
}

export const ProductSpecifications = ({ contents, productDescription }: ProductSpecificationsProps) => {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  const nextContent = () => {
    if (contents && contents.length > 0) {
      setCurrentContentIndex((prev) => (prev + 1) % contents.length);
    }
  };

  const prevContent = () => {
    if (contents && contents.length > 0) {
      setCurrentContentIndex((prev) => (prev - 1 + contents.length) % contents.length);
    }
  };

  const goToContent = (index: number) => {
    setCurrentContentIndex(index);
  };

  const isPdfFile = (url: string) => {
    try {
      return url.toLowerCase().trim().split('?')[0].endsWith('.pdf');
    } catch {
      return false;
    }
  };

  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-3 h-8 bg-green-500 rounded-full"></span>
          Especificaciones Técnicas
        </h2>
        <p className="text-gray-600 mt-2">Detalles técnicos y características del producto</p>
      </div>
      
      <div className="p-6">
        {/* Contenido principal */}
        <div className="relative mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            {isPdfFile(contents[currentContentIndex]) ? (
              <div className="w-full h-[500px] sm:h-[550px] flex flex-col gap-3">
                <iframe
                  src={`${contents[currentContentIndex]}#toolbar=1&navpanes=0`}
                  title={`PDF de ${productDescription}`}
                  className="w-full h-full rounded"
                />
                <div className="text-center">
                  <a
                    href={contents[currentContentIndex]}
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
                src={contents[currentContentIndex]} 
                alt={`${productDescription} - Especificaciones ${currentContentIndex + 1}`}
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
          {contents.length > 1 && (
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
        {contents.length > 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">Navegar por especificaciones:</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {contents.map((content, index) => (
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
    </div>
  );
};
