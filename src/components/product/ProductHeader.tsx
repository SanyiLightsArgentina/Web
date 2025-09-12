import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useQuoteList } from "@/hooks/use-quote-list";
import { openWhatsAppForModel } from "@/lib/contact";

interface ProductHeaderProps {
  product: Product;
}

export const ProductHeader = ({ product }: ProductHeaderProps) => {
  const { has, toggle } = useQuoteList();

  // Helper function to get category name
  const getCategoryName = (product: Product & { category_name?: string; category?: string }) => {
    return product?.category_name || product?.category || '';
  };

  return (
    <>
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
          <Badge variant="outline">{getCategoryName(product)}</Badge>
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
    </>
  );
};
