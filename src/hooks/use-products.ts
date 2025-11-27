import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  ProductsResponse,
} from "@/types/products";
import type { PaginatedResponse } from "@/types/pagination";

export function useProducts() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["products", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: ProductsResponse }>("/products");
      const data = response.data.data;
      // Se for objeto paginado (tem propriedade 'data' e 'meta'), extrair o array
      if (data && typeof data === 'object' && !Array.isArray(data) && 'data' in data && 'meta' in data) {
        return (data as PaginatedResponse<Product>).data;
      }
      // Caso contrário, retornar como array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });
}

export function useProductsWithFilters(filters: ProductFilters) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["products", "filtered", filters, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append("categories", cat));
      }
      if (filters.lowStock !== undefined) params.append("lowStock", filters.lowStock.toString());
      if (filters.minSalePrice) params.append("minSalePrice", filters.minSalePrice.toString());
      if (filters.maxSalePrice) params.append("maxSalePrice", filters.maxSalePrice.toString());
      if (filters.minCostPrice) params.append("minCostPrice", filters.minCostPrice.toString());
      if (filters.maxCostPrice) params.append("maxCostPrice", filters.maxCostPrice.toString());
      
      const response = await api.get<{ data: PaginatedResponse<Product> }>(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useProduct(id: string | null) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["product", id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      const response = await api.get<{ data: Product }>(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!userId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.post<{ data: Product }>("/products", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.patch<{ data: Product }>(`/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete("/products/bulk", { data: { ids } });
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${ids.length} produto(s) excluído(s) com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLowStockProducts() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["products", "low-stock", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Product[] }>("/products/low-stock");
      return response.data.data;
    },
    enabled: !!userId,
  });
}
