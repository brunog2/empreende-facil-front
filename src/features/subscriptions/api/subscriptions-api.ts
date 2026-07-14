import { api } from "@/lib/api";
import {
  AdminSubscription,
  CheckoutInput,
  CheckoutResult,
  Paginated,
  Payment,
  Plan,
  PlanUsage,
  Subscription,
  SubscriptionMetrics,
} from "../types/subscription";

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export const subscriptionsApi = {
  async plans(): Promise<Plan[]> {
    return (await api.get<ApiResponse<Plan[]>>("/plans")).data.data;
  },
  async mine(): Promise<Subscription> {
    return (await api.get<ApiResponse<Subscription>>("/subscriptions/me")).data.data;
  },
  async usage(): Promise<PlanUsage> {
    return (await api.get<ApiResponse<PlanUsage>>("/subscriptions/me/usage")).data.data;
  },
  async payments(): Promise<Payment[]> {
    return (await api.get<ApiResponse<Payment[]>>("/subscriptions/me/payments")).data.data;
  },
  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    return (await api.post<ApiResponse<CheckoutResult>>("/subscriptions/checkout", input)).data.data;
  },
  async changePlan(input: CheckoutInput): Promise<CheckoutResult> {
    return (await api.post<ApiResponse<CheckoutResult>>("/subscriptions/change-plan", input)).data.data;
  },
  async cancel(): Promise<Subscription> {
    return (await api.post<ApiResponse<Subscription>>("/subscriptions/cancel")).data.data;
  },
  async reactivate(): Promise<Subscription> {
    return (await api.post<ApiResponse<Subscription>>("/subscriptions/reactivate")).data.data;
  },
  async adminSubscriptions(params: Record<string, string | number | undefined>) {
    return (
      await api.get<ApiResponse<Paginated<AdminSubscription>>>("/admin/subscriptions", { params })
    ).data.data;
  },
  async adminMetrics(): Promise<SubscriptionMetrics> {
    return (await api.get<ApiResponse<SubscriptionMetrics>>("/admin/subscriptions/metrics")).data.data;
  },
  async adminPlans(): Promise<Plan[]> {
    return (await api.get<ApiResponse<Plan[]>>("/admin/plans")).data.data;
  },
  async updatePlan(id: string, input: Partial<Plan>): Promise<Plan> {
    return (await api.patch<ApiResponse<Plan>>(`/admin/plans/${id}`, input)).data.data;
  },
  async createPlan(input: Omit<Plan, "id" | "createdAt" | "updatedAt">): Promise<Plan> {
    return (await api.post<ApiResponse<Plan>>("/admin/plans", input)).data.data;
  },
  async adminPayments(params: Record<string, string | number | undefined>) {
    return (
      await api.get<ApiResponse<Paginated<Payment & { subscription: AdminSubscription }>>>(
        "/admin/payments",
        { params },
      )
    ).data.data;
  },
  async extendTrial(id: string, days: number): Promise<AdminSubscription> {
    return (
      await api.post<ApiResponse<AdminSubscription>>(
        `/admin/subscriptions/${id}/extend-trial`,
        { days },
      )
    ).data.data;
  },
  async adminChangePlan(id: string, planCode: string): Promise<AdminSubscription> {
    return (
      await api.post<ApiResponse<AdminSubscription>>(
        `/admin/subscriptions/${id}/change-plan`,
        { planCode },
      )
    ).data.data;
  },
  async suspend(id: string): Promise<AdminSubscription> {
    return (
      await api.post<ApiResponse<AdminSubscription>>(`/admin/subscriptions/${id}/suspend`, {})
    ).data.data;
  },
  async adminReactivate(id: string): Promise<AdminSubscription> {
    return (
      await api.post<ApiResponse<AdminSubscription>>(`/admin/subscriptions/${id}/reactivate`)
    ).data.data;
  },
};
