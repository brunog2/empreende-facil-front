import { PaginatedResponse } from "./pagination";

export interface Category {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export type CategoriesResponse = Category[] | PaginatedResponse<Category>;

