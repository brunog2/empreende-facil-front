import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/lib/api";
import { useCurrentUserId } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  isRecurring: boolean;
  recurrencePeriod: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  category: string;
  expenseDate?: Date;
  isRecurring?: boolean;
  recurrencePeriod?: string | null;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  category?: string;
  expenseDate?: Date;
  isRecurring?: boolean;
  recurrencePeriod?: string | null;
}

export function useExpenses() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Expense[] }>("/expenses");
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useExpense(id: string | null) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["expense", id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      const response = await api.get<{ data: Expense }>(`/expenses/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!userId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (data: CreateExpenseDto) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.post<{ data: Expense }>("/expenses", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseDto }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.patch<{ data: Expense }>(`/expenses/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { data: userId } = useCurrentUserId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Usuário não autenticado");
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Despesa excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMonthlyExpensesTotal(year: number, month: number) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["expenses", "monthly-total", year, month, userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: number }>(`/expenses/monthly-total?year=${year}&month=${month}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useExpensesByCategory(category: string | null) {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["expenses", "by-category", category, userId],
    queryFn: async () => {
      if (!category || !userId) return [];
      const response = await api.get<{ data: Expense[] }>(`/expenses/by-category?category=${encodeURIComponent(category)}`);
      return response.data.data;
    },
    enabled: !!userId && !!category,
    staleTime: 0,
  });
}

export function useRecurringExpenses() {
  const { data: userId } = useCurrentUserId();
  
  return useQuery({
    queryKey: ["expenses", "recurring", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Usuário não autenticado");
      const response = await api.get<{ data: Expense[] }>("/expenses/recurring");
      return response.data.data;
    },
    enabled: !!userId,
  });
}
