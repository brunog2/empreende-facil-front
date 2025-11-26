import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export function useCustomers() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["customers", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Customer[] }>("/customers");
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
