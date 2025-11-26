import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName: string | null;
  phone: string | null;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await api.get<{ data: User }>("/auth/me");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Mantém no cache por 10 minutos
    retry: 1,
  });
}

export function useCurrentUserId() {
  const { data: user, ...rest } = useCurrentUser();
  return {
    ...rest,
    data: user?.id,
  };
}

