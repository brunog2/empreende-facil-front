import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "../context/SubscriptionProvider";
import { PlanUsage } from "../types/subscription";
import { usagePercentage } from "../utils/subscription-utils";

const labels: Record<keyof PlanUsage, string> = {
  products: "produtos",
  customers: "clientes",
  salesPerMonth: "vendas no mês",
};

export function PlanLimitWarningDialog() {
  const navigate = useNavigate();
  const { usage, plan } = useSubscription();
  const [open, setOpen] = useState(false);

  const warning = useMemo(() => {
    if (!usage) return null;
    return (Object.entries(usage) as Array<[keyof PlanUsage, PlanUsage[keyof PlanUsage]]>)
      .filter(([, item]) => item.limit !== null && usagePercentage(item.current, item.limit) >= 80)
      .sort(
        (left, right) =>
          usagePercentage(right[1].current, right[1].limit) -
          usagePercentage(left[1].current, left[1].limit),
      )[0] ?? null;
  }, [usage]);

  useEffect(() => {
    if (!warning || !plan) return;
    const percentage = usagePercentage(warning[1].current, warning[1].limit);
    const band = percentage >= 100 ? "reached" : "near";
    const key = `plan-limit-warning:${plan.code}:${warning[0]}:${band}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "shown");
    setOpen(true);
  }, [plan, warning]);

  if (!warning) return null;
  const [resource, item] = warning;
  const percentage = usagePercentage(item.current, item.limit);
  const reached = percentage >= 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Gauge className="h-5 w-5" />
          </div>
          <DialogTitle>
            {reached ? "Você atingiu um limite do plano" : "Seu plano está próximo do limite"}
          </DialogTitle>
          <DialogDescription>
            Você utilizou {item.current} de {item.limit} {labels[resource]}. Compare os planos para continuar crescendo sem interromper a operação.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm"><span className="font-medium capitalize">{labels[resource]}</span><span>{percentage}% utilizado</span></div>
          <Progress value={percentage} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Continuar no plano</Button>
          <Button onClick={() => navigate("/planos")}>
            Ver planos melhores <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
