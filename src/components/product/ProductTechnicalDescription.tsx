import { Product } from "@/data/products";

interface ProductTechnicalDescriptionProps {
  technical_description: string;
}

export const ProductTechnicalDescription = ({ technical_description }: ProductTechnicalDescriptionProps) => {
  if (!technical_description || technical_description.trim() === '') {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
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
