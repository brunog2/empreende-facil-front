export type PlanFeature =
  | "dashboard"
  | "sales"
  | "products"
  | "categories"
  | "customers"
  | "expenses"
  | "reports"
  | "advancedReports"
  | "dataExport"
  | "automaticBackup"
  | "userPermissions"
  | "prioritySupport"
  | "premiumSupport";

export type PlanLimit = "products" | "customers" | "salesPerMonth" | "users";
export type PlanFeatures = Record<PlanFeature, boolean>;
export type PlanLimits = Record<PlanLimit, number | null>;
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "suspended"
  | "canceled"
  | "expired";
export type BillingCycle = "monthly" | "yearly";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "canceled";

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  trialDays: number | null;
  features: PlanFeatures;
  limits: PlanLimits;
  isActive: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEndsAt: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  lockedMonthlyPrice: string | null;
  lockedYearlyPrice: string | null;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
}

export interface Payment {
  id: string;
  amount: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  dueDate: string | null;
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageItem {
  current: number;
  limit: number | null;
}

export interface PlanUsage {
  products: UsageItem;
  customers: UsageItem;
  salesPerMonth: UsageItem;
}

export interface CheckoutInput {
  planCode: string;
  billingCycle: BillingCycle;
}

export interface CheckoutResult {
  code: "PAYMENT_CONFIRMATION_PENDING";
  message: string;
  checkoutUrl: string | null;
  payment: Payment;
}

export interface AdminSubscription extends Subscription {
  user: {
    id: string;
    fullName: string;
    email: string;
    businessName: string | null;
    isActive: boolean;
  } | null;
  lastPayment?: Payment | null;
  payments?: Payment[];
}

export interface SubscriptionMetrics {
  total: number;
  trialing: number;
  active: number;
  pastDue: number;
  suspended: number;
  canceled: number;
  expired: number;
  byPlan: Array<{ code: string; name: string; count: number }>;
  estimatedMrr: string;
  confirmedRevenueThisMonth: string;
  newThisMonth: number;
  canceledThisMonth: number;
  timeline: Array<{
    month: string;
    newSubscriptions: number;
    cancellations: number;
  }>;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
