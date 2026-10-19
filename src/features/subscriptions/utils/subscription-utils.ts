import {
  PlanFeature,
  PaymentStatus,
  Subscription,
  SubscriptionStatus,
} from "../types/subscription";

export const featureLabels: Record<PlanFeature, string> = {
  dashboard: "Dashboard",
  sales: "Vendas",
  products: "Produtos e estoque",
  categories: "Categorias",
  customers: "Clientes",
  expenses: "Despesas",
  reports: "Relatórios básicos",
  advancedReports: "Relatórios avançados",
  dataExport: "Exportação Excel/PDF",
  automaticBackup: "Backup automático",
  prioritySupport: "Suporte prioritário",
  premiumSupport: "Suporte premium",
};

export const featureOrder: PlanFeature[] = [
  "dashboard",
  "sales",
  "products",
  "categories",
  "customers",
  "expenses",
  "reports",
  "advancedReports",
  "dataExport",
  "automaticBackup",
  "prioritySupport",
  "premiumSupport",
];

export function featuresForDisplay(
  features: Record<PlanFeature, boolean>,
): PlanFeature[] {
  return featureOrder.filter((feature) => {
    if (!features[feature]) return false;
    if (feature === "reports" && features.advancedReports) return false;
    if (feature === "prioritySupport" && features.premiumSupport) return false;
    return true;
  });
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  trialing: "Em teste",
  active: "Ativa",
  past_due: "Pagamento atrasado",
  suspended: "Suspensa",
  canceled: "Cancelada",
  expired: "Expirada",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
  canceled: "Cancelado",
};

export function formatMoney(value: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function daysUntil(value: string | null): number | null {
  if (!value) return null;
  return Math.max(
    0,
    Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}

export function isSubscriptionBlocked(subscription?: Subscription): boolean {
  if (!subscription) return true;
  const now = Date.now();
  if (
    subscription.planAccessEndsAt &&
    new Date(subscription.planAccessEndsAt).getTime() <= now
  ) {
    return true;
  }
  if (subscription.status === "trialing") {
    return !subscription.trialEndsAt || new Date(subscription.trialEndsAt).getTime() <= now;
  }
  if (subscription.status === "active") {
    return Boolean(
      subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd).getTime() <= now,
    );
  }
  if (subscription.status === "past_due") {
    return !subscription.gracePeriodEndsAt || new Date(subscription.gracePeriodEndsAt).getTime() <= now;
  }
  return true;
}

export function usagePercentage(current: number, limit: number | null): number {
  if (limit === null || limit === 0) return limit === 0 ? 100 : 0;
  return Math.min(100, Math.round((current / limit) * 100));
}
