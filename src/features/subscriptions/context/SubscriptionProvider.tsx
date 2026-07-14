import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  useMySubscription,
  useSubscriptionUsage,
} from "../hooks/use-subscriptions";
import {
  Plan,
  PlanFeature,
  PlanLimit,
  PlanUsage,
  Subscription,
} from "../types/subscription";
import { isSubscriptionBlocked } from "../utils/subscription-utils";

interface SubscriptionContextValue {
  subscription?: Subscription;
  plan?: Plan;
  usage?: PlanUsage;
  isLoading: boolean;
  isError: boolean;
  canAccessFeature: (feature: PlanFeature) => boolean;
  hasReachedLimit: (limit: PlanLimit) => boolean;
  isSubscriptionBlocked: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscriptionQuery = useMySubscription();
  const usageQuery = useSubscriptionUsage(Boolean(subscriptionQuery.data));

  const value = useMemo<SubscriptionContextValue>(() => {
    const subscription = subscriptionQuery.data;
    const usage = usageQuery.data;
    return {
      subscription,
      plan: subscription?.plan,
      usage,
      isLoading: subscriptionQuery.isLoading || (Boolean(subscription) && usageQuery.isLoading),
      isError: subscriptionQuery.isError || usageQuery.isError,
      canAccessFeature: (feature) => Boolean(subscription?.plan.features[feature]),
      hasReachedLimit: (limit) => {
        if (limit === "users") return false;
        const item = usage?.[limit];
        return Boolean(item && item.limit !== null && item.current >= item.limit);
      },
      isSubscriptionBlocked: isSubscriptionBlocked(subscription),
    };
  }, [subscriptionQuery.data, subscriptionQuery.isError, subscriptionQuery.isLoading, usageQuery.data, usageQuery.isError, usageQuery.isLoading]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription deve ser usado dentro de SubscriptionProvider");
  }
  return context;
}
