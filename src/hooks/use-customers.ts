import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
  CustomersResponse,
} from "@/types/customers";
import type { PaginatedResponse } from "@/types/pagination";

export function useCustomers() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: CustomersResponse }>("/customers");
      const data = response.data.data;
      // Se for objeto paginado (tem propriedade 'data' e 'meta'), extrair o array
      if (data && typeof data === 'object' && !Array.isArray(data) && 'data' in data && 'meta' in data) {
        return (data as PaginatedResponse<Customer>).data;
      }
      // Caso contrário, retornar como array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });
}

export function useCustomersWithFilters(filters: CustomerFilters) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["customers", "filtered", filters, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      
      const response = await api.get<{ data: PaginatedResponse<Customer> }>(`/customers?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useCustomer(id: string | null) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["customer", id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      const response = await api.get<{ data: Customer }>(`/customers/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!userId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (data: CreateCustomerDto) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.post<{ data: Customer }>("/customers", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.patch<{ data: Customer }>(`/customers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete("/customers/bulk", { data: { ids } });
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`${ids.length} cliente(s) excluído(s) com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSearchCustomers(query: string) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["customers", "search", query, userId],
    queryFn: async () => {
      if (!userId || !query) return [];
      const response = await api.get<{ data: Customer[] }>(`/customers/search?q=${encodeURIComponent(query)}`);
      return response.data.data;
    },
    enabled: !!userId && query.length > 0,
  });
}
