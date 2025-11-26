import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: {
    id: string;
    name: string;
  };
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

export function useSales() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sales", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Sale[] }>("/sales");
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useSale(id: string | null) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sale", id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      const response = await api.get<{ data: Sale }>(`/sales/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!userId,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (data: CreateSaleDto) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.post<{ data: Sale }>("/sales", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Venda realizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSaleDto }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.patch<{ data: Sale }>(`/sales/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Venda atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete(`/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Venda excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMonthlySalesTotal(year: number, month: number) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sales", "monthly-total", year, month, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: number }>(`/sales/monthly-total?year=${year}&month=${month}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useTopProducts(limit: number = 5) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sales", "top-products", limit, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Array<{
        productId: string;
        productName: string;
        totalQuantity: number;
        totalRevenue: number;
      }> }>(`/sales/top-products?limit=${limit}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}
