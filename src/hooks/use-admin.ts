import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  AdminOverview,
  ManagedUser,
  ManagedUsersResponse,
  UserPermission,
} from "@/types/admin";

export interface ManagedUsersFilters {
  page: number;
  limit: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}

export interface UpdateManagedUserInput {
  id: string;
  email: string;
  fullName: string;
  businessName: string | null;
  phone: string | null;
  isActive: boolean;
  permissions: UserPermission[];
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const response = await api.get<{ data: AdminOverview }>(
        "/admin/overview",
      );
      return response.data.data;
    },
  });
}

export function useManagedUsers(filters: ManagedUsersFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: async () => {
      const response = await api.get<{ data: ManagedUsersResponse }>(
        "/admin/users",
        { params: filters },
      );
      return response.data.data;
    },
  });
}

export function useUpdateManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateManagedUserInput) => {
      const response = await api.patch<{ data: ManagedUser }>(
        `/admin/users/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useDeleteManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

