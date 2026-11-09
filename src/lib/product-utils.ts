import { Product } from "@/data/products";
import type { Category } from "@/lib/catalog";

type NormalizedProductText = {
  model: string;
  description: string;
  haystack: string;
  modelLength: number;
};

type CatalogSearchIndex = {
  texts: NormalizedProductText[];
};

// Products come from react-query and the array keeps its identity between
// renders, so the lowercase search text is derived once per catalog snapshot.
const searchIndexByProducts = new WeakMap<Product[], CatalogSearchIndex>();

const getSearchIndex = (products: Product[]): CatalogSearchIndex => {
  let index = searchIndexByProducts.get(products);
  if (!index) {
    index = {
      texts: products.map(product => {
        const model = product.model.toLowerCase();
        const description = (product.description ?? '').toLowerCase();
        return { model, description, haystack: `${model}\u0000${description}`, modelLength: model.length };
      }),
    };
    searchIndexByProducts.set(products, index);
  }
  return index;
};

export type ProductCriteria = {
  query?: string;
  categoryName?: string;
  categoryId?: number | null;
  onlyNew?: boolean;
};

export const selectProducts = <T extends Product>(
  products: T[],
  criteria: ProductCriteria = {},
  categories: Category[] = [],
): T[] => {
  // Validar que products sea un array
  if (!Array.isArray(products)) {
    return [];
  }

  const { categoryName: selectedCategory = '', categoryId, onlyNew: showOnlyNew = false } = criteria;
  const query = (criteria.query ?? '').trim().toLowerCase();
  const hasCategoryFilter = selectedCategory !== '' || categoryId != null;

  // The unfiltered catalog is the most common state; avoid walking it at all.
  if (!query && !hasCategoryFilter && !showOnlyNew) return products.slice();

  // Resolve the category name once instead of scanning categories per product.
  const categoryIds = hasCategoryFilter
    ? new Set(categoryId != null ? [categoryId] : categories.filter(category => category.name === selectedCategory).map(category => category.id))
    : null;

  const matches: T[] = [];

  // Category/new filters do not need the text index.
  if (!query) {
    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      if (showOnlyNew && !product.new) continue;
      if (categoryIds && !categoryIds.has(product.category_id)) continue;
      matches.push(product);
    }
    return matches;
  }

  const texts = getSearchIndex(products).texts;

  // Search-only is the common case while the user types.
  if (!showOnlyNew && !categoryIds) {
    for (let index = 0; index < products.length; index += 1) {
      const text = texts[index];
      const position = text.haystack.indexOf(query);
      if (position === -1) continue;
      const end = position + query.length;
      // A match fully inside either field is valid. Cross-boundary hits are rare
      // (the query would span the separator), so confirm those against each field.
      if (end <= text.modelLength || position > text.modelLength) {
        matches.push(products[index]);
      } else if (text.model.includes(query) || text.description.includes(query)) {
        matches.push(products[index]);
      }
    }
    return matches;
  }

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    if (showOnlyNew && !product.new) continue;
    if (categoryIds && !categoryIds.has(product.category_id)) continue;

    const text = texts[index];
    const position = text.haystack.indexOf(query);
    if (position === -1) continue;
    const end = position + query.length;
    if (end <= text.modelLength || position > text.modelLength) {
      matches.push(product);
    } else if (text.model.includes(query) || text.description.includes(query)) {
      matches.push(product);
    }
  }
  return matches;
};

export const getFeaturedProducts = <T extends Product>(products: T[], count: number = 6): T[] => {
  // Validar que products sea un array
  if (!Array.isArray(products)) {
    console.warn('getFeaturedProducts: products no es un array, retornando array vacío');
    return [];
  }

  // The catalog is ordered by created_at, so new products are grouped at the
  // front; the search dialog only needs the first few. Stop reading as soon as
  // the requested number is collected, and keep filter/slice semantics for
  // unusual limits.
  if (Number.isInteger(count) && count >= 0) {
    const matches: T[] = [];
    if (count === 0) return matches;
    for (let index = 0; index < products.length; index += 1) {
      if (!(index in products)) continue;
      const product = products[index];
      if (product.new !== true) continue;
      matches.push(product);
      if (matches.length === count) break;
    }
    return matches;
  }

  return products.filter(product => product.new === true).slice(0, count);
};

export const getProductsByCategoryId = <T extends Product>(products: T[], categoryId: number, count: number = 3, excludeModel?: string): T[] => {
  if (!categoryId) return [];

  // Keep slice semantics for negative, fractional and non-finite limits.
  if (Number.isInteger(count) && count >= 0) {
    const matches: T[] = [];
    if (count === 0) return matches;
    for (let index = 0; index < products.length; index += 1) {
      if (!(index in products)) continue;
      const product = products[index];
      if (product.category_id !== categoryId || product.model === excludeModel) continue;
      matches.push(product);
      // Related-product cards only need the first few matches in catalog order.
      if (matches.length === count) break;
    }
    return matches;
  }

  const categoryProducts = products.filter(product => 
    product.category_id === categoryId && product.model !== excludeModel
  );
  
  return categoryProducts.slice(0, count);
}; 
