import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
  CategoriesResponse,
} from "@/types/categories";
import type { PaginatedResponse } from "@/types/pagination";

export function useCategories() {
  const { data: userId } = useCurrentUserId();

  return useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: CategoriesResponse }>(
        "/categories"
      );
      const data = response.data.data;
      // Se for objeto paginado (tem propriedade 'data' e 'meta'), extrair o array
      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        "data" in data &&
        "meta" in data
      ) {
        return (data as PaginatedResponse<Category>).data;
      }
      // Caso contrário, retornar como array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });
}

export function useCategoriesWithFilters(filters: CategoryFilters) {
  const { data: userId } = useCurrentUserId();

  return useQuery({
    queryKey: ["categories", "filtered", filters, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);

      const response = await api.get<{ data: PaginatedResponse<Category> }>(
        `/categories?${params.toString()}`
      );
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useCategory(id: string | null) {
  const { data: userId } = useCurrentUserId();

  return useQuery({
    queryKey: ["category", id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      const response = await api.get<{ data: Category }>(`/categories/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!userId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.post<{ data: Category }>("/categories", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryDto;
    }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.patch<{ data: Category }>(
        `/categories/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categoria atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Categoria excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBulkDeleteCategories() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete("/categories/bulk", { data: { ids } });
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${ids.length} categoria(s) excluída(s) com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSearchCategories(query: string) {
  const { data: userId } = useCurrentUserId();

  return useQuery({
    queryKey: ["categories", "search", query, userId],
    queryFn: async () => {
      if (!userId || !query) return [];
      const response = await api.get<{ data: Category[] }>(
        `/categories/search?q=${encodeURIComponent(query)}`
      );
      return response.data.data;
    },
    enabled: !!userId && query.length > 0,
  });
}
