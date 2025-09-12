import { Category } from "@/hooks/use-supabase-categories";

export interface Product {
  id?: number;
  model: string;
  description: string;
  technical_description?: string;
  category_id: number;
  category?: Category; // Relación opcional para cuando se hace join
  images?: string[];
  contents?: string[];
  videos?: string[];
  new: boolean;
  created_at?: string;
  updated_at?: string;
}