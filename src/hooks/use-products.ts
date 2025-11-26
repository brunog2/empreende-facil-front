import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";

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

export function useProducts() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["products", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Product[] }>("/products");
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
