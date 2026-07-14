import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "../api/subscriptions-api";
import { CheckoutInput, CheckoutResult } from "../types/subscription";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: ["subscriptions", "plans"] as const,
  mine: ["subscriptions", "mine"] as const,
  usage: ["subscriptions", "usage"] as const,
  payments: ["subscriptions", "payments"] as const,
  admin: (filters: object) => ["subscriptions", "admin", filters] as const,
  metrics: ["subscriptions", "admin", "metrics"] as const,
  adminPlans: ["subscriptions", "admin", "plans"] as const,
  adminPayments: (filters: object) => ["subscriptions", "admin", "payments", filters] as const,
};

export const usePlans = () =>
  useQuery({ queryKey: subscriptionKeys.plans, queryFn: subscriptionsApi.plans });

export const useMySubscription = (enabled = true) =>
  useQuery({
    queryKey: subscriptionKeys.mine,
    queryFn: subscriptionsApi.mine,
    enabled,
    staleTime: 60_000,
  });

export const useSubscriptionUsage = (enabled = true) =>
  useQuery({
    queryKey: subscriptionKeys.usage,
    queryFn: subscriptionsApi.usage,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

export const useSubscriptionPayments = (enabled = true) =>
  useQuery({ queryKey: subscriptionKeys.payments, queryFn: subscriptionsApi.payments, enabled });

function useSubscriptionMutation(
  mutationFn: (input: CheckoutInput) => Promise<CheckoutResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
}

export const useCreateCheckout = () => useSubscriptionMutation(subscriptionsApi.checkout);
export const useChangePlan = () => useSubscriptionMutation(subscriptionsApi.changePlan);

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.cancel,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
};

export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.reactivate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
  });
};

export const useAdminSubscriptions = (filters: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: subscriptionKeys.admin(filters),
    queryFn: () => subscriptionsApi.adminSubscriptions(filters),
  });

export const useSubscriptionMetrics = () =>
  useQuery({ queryKey: subscriptionKeys.metrics, queryFn: subscriptionsApi.adminMetrics });

export const useAdminPlans = () =>
  useQuery({ queryKey: subscriptionKeys.adminPlans, queryFn: subscriptionsApi.adminPlans });

export function useAdminPlanMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.adminPlans }),
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans }),
  ]);
  return {
    create: useMutation({ mutationFn: subscriptionsApi.createPlan, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Parameters<typeof subscriptionsApi.updatePlan>[1] }) =>
        subscriptionsApi.updatePlan(id, data),
      onSuccess: invalidate,
    }),
  };
}

export const useAdminPayments = (filters: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: subscriptionKeys.adminPayments(filters),
    queryFn: () => subscriptionsApi.adminPayments(filters),
  });

export function useAdminSubscriptionActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  return {
    extendTrial: useMutation({
      mutationFn: ({ id, days }: { id: string; days: number }) => subscriptionsApi.extendTrial(id, days),
      onSuccess: invalidate,
    }),
    changePlan: useMutation({
      mutationFn: ({ id, planCode }: { id: string; planCode: string }) =>
        subscriptionsApi.adminChangePlan(id, planCode),
      onSuccess: invalidate,
    }),
    suspend: useMutation({ mutationFn: subscriptionsApi.suspend, onSuccess: invalidate }),
    reactivate: useMutation({ mutationFn: subscriptionsApi.adminReactivate, onSuccess: invalidate }),
  };
}
