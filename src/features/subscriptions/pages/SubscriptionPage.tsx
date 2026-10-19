import { CreditCard, RefreshCcw, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api";
import { useSubscription } from "../context/SubscriptionProvider";
import { useCancelSubscription, useCreateCheckout, useReactivateSubscription, useSubscriptionPayments } from "../hooks/use-subscriptions";
import { SubscriptionStatusBadge } from "../components/SubscriptionStatusBadge";
import { formatDate, formatMoney, paymentStatusLabels, statusLabels, usagePercentage, daysUntil } from "../utils/subscription-utils";

const usageLabels = { products: "Produtos", customers: "Clientes", salesPerMonth: "Vendas no mês" };

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { subscription, plan, usage, isLoading } = useSubscription();
  const payments = useSubscriptionPayments(Boolean(subscription));
  const cancel = useCancelSubscription();
  const reactivate = useReactivateSubscription();
  const checkout = useCreateCheckout();

  if (isLoading) return <div className="p-6"><div className="h-96 animate-pulse rounded-xl bg-muted" /></div>;
  if (!subscription || !plan) return <div className="p-6">Não foi possível carregar sua assinatura.</div>;
  const isFreePlan = plan.code === "trial";

  const run = async (action: () => Promise<unknown>, success: string) => {
    try { await action(); toast.success(success); } catch (error) { toast.error(getErrorMessage(error)); }
  };
  const renewal = subscription.currentPeriodEnd ?? subscription.trialEndsAt;
  const trialDays = daysUntil(subscription.trialEndsAt);
  const currentPrice = subscription.billingCycle === "yearly"
    ? subscription.lockedYearlyPrice ?? plan.yearlyPrice
    : subscription.lockedMonthlyPrice ?? plan.monthlyPrice;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-1 flex items-center gap-2 text-sm font-medium text-primary"><ShieldCheck className="h-4 w-4" />Conta e cobrança</p><h1 className="font-display text-3xl font-bold">Minha assinatura</h1><p className="text-muted-foreground">Acompanhe seu plano, uso e pagamentos em um só lugar.</p></div>
        <Button variant="outline" onClick={() => navigate("/planos")}>Comparar planos</Button>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <div className="h-1.5 bg-primary" />
        <CardHeader className="md:flex-row md:items-start md:justify-between">
          <div><div className="mb-3 flex items-center gap-3"><CardTitle className="text-2xl">{plan.name}</CardTitle><SubscriptionStatusBadge status={subscription.status} /></div><CardDescription>{plan.description}</CardDescription></div>
          <div className="mt-4 text-left md:mt-0 md:text-right"><p className="text-2xl font-bold">{isFreePlan ? "Grátis" : formatMoney(currentPrice)}</p><p className="text-sm text-muted-foreground">{isFreePlan ? "sem cobrança" : `ciclo ${subscription.billingCycle === "yearly" ? "anual" : "mensal"}`}</p>{subscription.planAccessEndsAt && <p className="mt-1 text-xs font-medium text-amber-700">Condição promocional até {formatDate(subscription.planAccessEndsAt)}</p>}</div>
        </CardHeader>
        <CardContent className="grid gap-4 border-t bg-muted/30 pt-6 sm:grid-cols-3">
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Situação</p><p className="mt-1 font-medium">{statusLabels[subscription.status]}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Próxima renovação</p><p className="mt-1 font-medium">{isFreePlan ? "Não possui" : formatDate(renewal)}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground">{isFreePlan ? "Plano gratuito" : "Período contratado"}</p><p className="mt-1 font-medium">{isFreePlan ? "Sem prazo de expiração" : subscription.status === "trialing" ? `${trialDays ?? 0} dias restantes` : "Ativo"}</p></div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card><CardHeader><CardTitle>Uso do plano</CardTitle><CardDescription>Limites atualizados com os seus dados reais.</CardDescription></CardHeader><CardContent className="space-y-6">{usage && Object.entries(usage).map(([key, item]) => <div key={key}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{usageLabels[key as keyof typeof usageLabels]}</span><span className="text-muted-foreground">{item.current} de {item.limit ?? "ilimitado"}</span></div><Progress value={usagePercentage(item.current, item.limit)} /><p className="mt-1 text-right text-xs text-muted-foreground">{item.limit === null ? "Sem limite" : `${usagePercentage(item.current, item.limit)}% utilizado`}</p></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Ações</CardTitle><CardDescription>{isFreePlan ? "Faça upgrade quando precisar de mais capacidade." : "Gerencie a continuidade da assinatura."}</CardDescription></CardHeader><CardContent className="space-y-3">
          <Button className="w-full" onClick={() => navigate("/planos")}>{isFreePlan ? "Conhecer planos pagos" : "Alterar plano"}</Button>
          {(subscription.status === "past_due" || subscription.status === "suspended") && <Button className="w-full" variant="secondary" disabled={checkout.isPending} onClick={() => run(() => checkout.mutateAsync({ planCode: plan.code, billingCycle: subscription.billingCycle }), "Pagamento iniciado.")}><CreditCard className="mr-2 h-4 w-4" />Regularizar pagamento</Button>}
          {!isFreePlan && (subscription.cancelAtPeriodEnd ? <Button className="w-full" variant="outline" disabled={reactivate.isPending} onClick={() => run(() => reactivate.mutateAsync(), "Cancelamento desfeito.")}><RefreshCcw className="mr-2 h-4 w-4" />Reativar assinatura</Button> : <Button className="w-full" variant="ghost" disabled={cancel.isPending} onClick={() => run(() => cancel.mutateAsync(), "Ao fim do período, sua conta retornará ao plano gratuito.")}>Cancelar plano pago</Button>)}
          {subscription.cancelAtPeriodEnd && <p className="text-center text-xs text-muted-foreground">Seu acesso continua até {formatDate(renewal)}.</p>}
        </CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Histórico de pagamentos</CardTitle><CardDescription>Somente confirmações recebidas do provedor são marcadas como pagas.</CardDescription></CardHeader><CardContent>{payments.isLoading ? <div className="h-28 animate-pulse rounded bg-muted" /> : payments.data?.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Pagamento</TableHead></TableRow></TableHeader><TableBody>{payments.data.map((payment) => <TableRow key={payment.id}><TableCell>{formatDate(payment.createdAt)}</TableCell><TableCell>{formatMoney(payment.amount)}</TableCell><TableCell>{paymentStatusLabels[payment.status]}</TableCell><TableCell>{formatDate(payment.paidAt)}</TableCell></TableRow>)}</TableBody></Table></div> : <div className="py-10 text-center text-muted-foreground"><CreditCard className="mx-auto mb-3 h-8 w-8 opacity-50" /><p>Nenhum pagamento registrado.</p></div>}</CardContent></Card>
    </div>
  );
}
