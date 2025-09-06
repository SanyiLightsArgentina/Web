import { Product } from "@/data/products";

interface ProductTechnicalDescriptionProps {
  technical_description: string;
}

export const ProductTechnicalDescription = ({ technical_description }: ProductTechnicalDescriptionProps) => {
  if (!technical_description || technical_description.trim() === '') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-8 bg-orange-500 rounded-full"></span>
            Descripción Técnica
          </h2>
          <p className="text-gray-600 mt-2">Especificaciones detalladas del producto</p>
        </div>
        <div className="p-6">
          <div className="prose prose-gray max-w-none whitespace-pre-wrap">
            {technical_description}
          </div>
        </div>
      </div>
  );
};
