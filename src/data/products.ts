export interface Product {
  id?: number;
  model: string;
  description: string;
  technical_description?: string;
  category_id: number;
  images?: string[];
  contents?: string[];
  videos?: string[];
  new: boolean;
  created_at?: string;
  updated_at?: string;
}