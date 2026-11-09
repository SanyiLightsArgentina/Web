import { Button } from "@/components/ui/button";
import { productDownloads } from "@/lib/product-downloads";

export function ProductSpecifications({ contents }: { contents: string[] }) {
  const downloads = productDownloads(contents);
  if (!downloads.length) return null;

  return (
    <div className="space-y-4">
      {downloads.map(({ href, kind, format }, index) => (
        <div key={`${href}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="min-w-10 h-10 px-1 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs">{format}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {kind === 'pdf' ? 'Manual Técnico' : kind === 'image' ? 'Especificaciones' : 'Archivo'}
              </p>
              <p className="text-sm text-gray-600">
                {kind === 'pdf' ? 'Documento PDF' : kind === 'image' ? 'Imagen de especificaciones' : 'Documento del producto'}
              </p>
            </div>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <a href={href} target="_blank" rel="noopener noreferrer">Descargar</a>
          </Button>
        </div>
      ))}
    </div>
  );
}
