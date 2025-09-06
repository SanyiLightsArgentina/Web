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
    <div>
      
      
      <div className="space-y-4">
        {contents.map((content, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">PDF</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isPdfFile(content) ? 'Manual Técnico' : 'Especificaciones'}
                </p>
                <p className="text-sm text-gray-600">
                  {isPdfFile(content) ? 'Documento PDF' : 'Imagen de especificaciones'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open(content, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Descargar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
