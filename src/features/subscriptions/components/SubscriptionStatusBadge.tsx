import { Badge } from "@/components/ui/badge";
import { SubscriptionStatus } from "../types/subscription";
import { statusLabels } from "../utils/subscription-utils";

const variants: Record<SubscriptionStatus, string> = {
  trialing: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  past_due: "border-amber-200 bg-amber-50 text-amber-700",
  suspended: "border-red-200 bg-red-50 text-red-700",
  canceled: "border-slate-200 bg-slate-50 text-slate-700",
  expired: "border-red-200 bg-red-50 text-red-700",
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge className={variants[status]}>{statusLabels[status]}</Badge>;
}
