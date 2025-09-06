import { Product } from "@/data/products";
import { ProductCard } from "@/components/ui/product-card";

interface RelatedProductsProps {
  relatedProducts: Product[];
}

export const RelatedProducts = ({ relatedProducts }: RelatedProductsProps) => {
  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
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
  );
};
