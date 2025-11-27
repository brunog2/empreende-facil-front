import { PaginatedResponse } from "./pagination";

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string | null;
  productPrice: number | null;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface Sale {
  id: string;
  userId: string;
  customerId: string | null;
  totalAmount: number;
  paymentMethod: string | null;
  notes: string | null;
  saleDate: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  } | null;
  saleItems: SaleItem[];
}

export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleDto {
  customerId?: string | null;
  totalAmount: number;
  paymentMethod?: string | null;
  notes?: string | null;
  saleDate?: Date;
  items: CreateSaleItemDto[];
}

export interface UpdateSaleDto {
  customerId?: string | null;
  totalAmount?: number;
  paymentMethod?: string | null;
  notes?: string | null;
  saleDate?: Date;
  items?: CreateSaleItemDto[];
}

export interface SaleFilters {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string[];
  products?: string[];
  startDate?: string;
  endDate?: string;
}

export type SalesResponse = Sale[] | PaginatedResponse<Sale>;

