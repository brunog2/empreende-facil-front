import { PaginatedResponse } from "./pagination";

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string | null;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string | null;
  category?: string | null;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string | null;
  category?: string | null;
  costPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string[];
  lowStock?: boolean;
  minSalePrice?: number;
  maxSalePrice?: number;
  minCostPrice?: number;
  maxCostPrice?: number;
}

export type ProductsResponse = Product[] | PaginatedResponse<Product>;

