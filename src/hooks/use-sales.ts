import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";
import type {
  Sale,
  SaleItem,
  CreateSaleDto,
  CreateSaleItemDto,
  UpdateSaleDto,
  SaleFilters,
  SalesResponse,
} from "@/types/sales";
import type { PaginatedResponse } from "@/types/pagination";

export function useSales() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sales", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: SalesResponse }>("/sales");
      const data = response.data.data;
      // Se for objeto paginado (tem propriedade 'data' e 'meta'), extrair o array
      if (data && typeof data === 'object' && !Array.isArray(data) && 'data' in data && 'meta' in data) {
        return (data as PaginatedResponse<Sale>).data;
      }
      // Caso contrário, retornar como array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });
}

export function useSalesWithFilters(filters: SaleFilters) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["sales", "filtered", filters, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append("categories", cat));
      }
      if (filters.products && filters.products.length > 0) {
        filters.products.forEach(prod => params.append("products", prod));
      }
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      
      const response = await api.get<{ data: PaginatedResponse<Sale> }>(`/sales?${params.toString()}`);
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

export function useBulkDeleteSales() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete("/sales/bulk", { data: { ids } });
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`${ids.length} venda(s) excluída(s) com sucesso!`);
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
