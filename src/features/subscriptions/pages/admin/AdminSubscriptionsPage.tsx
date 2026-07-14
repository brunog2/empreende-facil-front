import { useMemo, useState } from "react";
import { CalendarPlus, CircleDollarSign, Eye, PauseCircle, PlayCircle, Search, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api";
import { AdminSubscriptionCharts } from "../../components/AdminSubscriptionCharts";
import { SubscriptionStatusBadge } from "../../components/SubscriptionStatusBadge";
import { useAdminPlans, useAdminSubscriptionActions, useAdminSubscriptions, useSubscriptionMetrics } from "../../hooks/use-subscriptions";
import { AdminSubscription, SubscriptionStatus } from "../../types/subscription";
import { formatDate, formatMoney } from "../../utils/subscription-utils";

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [plan, setPlan] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminSubscription | null>(null);
  const filters = useMemo(() => ({ search: search || undefined, status: status === "all" ? undefined : status, plan: plan === "all" ? undefined : plan, page, limit: 15 }), [search, status, plan, page]);
  const subscriptions = useAdminSubscriptions(filters);
  const metrics = useSubscriptionMetrics();
  const plans = useAdminPlans();
  const actions = useAdminSubscriptionActions();

  const execute = async (action: () => Promise<unknown>, success: string) => {
    try { await action(); toast.success(success); } catch (error) { toast.error(getErrorMessage(error)); }
  };
  const cards = metrics.data ? [
    { title: "Total", value: metrics.data.total, icon: UsersRound },
    { title: "Testes legados", value: metrics.data.trialing, icon: CalendarPlus },
    { title: "Ativas", value: metrics.data.active, icon: PlayCircle },
    { title: "MRR estimada", value: formatMoney(metrics.data.estimatedMrr), icon: CircleDollarSign },
  ] : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div><h1 className="font-display text-3xl font-bold">Assinaturas</h1><p className="text-muted-foreground">Acompanhe planos, receita estimada e a saúde da base.</p></div>
      {metrics.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((i)=><Skeleton key={i} className="h-28" />)}</div> : metrics.data && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card)=><Card key={card.title}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{card.title}</CardTitle><card.icon className="h-4 w-4 text-primary" /></CardHeader><CardContent><p className="text-3xl font-bold">{card.value}</p></CardContent></Card>)}</div><AdminSubscriptionCharts metrics={metrics.data} /></>}

      <Card><CardHeader><CardTitle>Contas e assinaturas</CardTitle><div className="grid gap-3 pt-3 md:grid-cols-3"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Nome, e-mail ou negócio" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} /></div><Select value={status} onValueChange={(value)=>{setStatus(value);setPage(1);}}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{(["trialing","active","past_due","suspended","canceled","expired"] as SubscriptionStatus[]).map((value)=><SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Select value={plan} onValueChange={(value)=>{setPlan(value);setPage(1);}}><SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os planos</SelectItem>{plans.data?.map((item)=><SelectItem key={item.id} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select></div></CardHeader><CardContent>
        {subscriptions.isLoading ? <div className="space-y-2">{[1,2,3,4].map((i)=><Skeleton key={i} className="h-14" />)}</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Responsável</TableHead><TableHead>Negócio</TableHead><TableHead>Plano</TableHead><TableHead>Status</TableHead><TableHead>Ciclo</TableHead><TableHead>Renovação</TableHead><TableHead>Último pagamento</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{subscriptions.data?.data.map((item)=><TableRow key={item.id}><TableCell><p className="font-medium">{item.user?.fullName ?? "Conta excluída"}</p><p className="text-xs text-muted-foreground">{item.user?.email ?? "Histórico preservado"}</p></TableCell><TableCell>{item.user?.businessName ?? "—"}</TableCell><TableCell>{item.plan.name}</TableCell><TableCell><SubscriptionStatusBadge status={item.status} /></TableCell><TableCell>{item.billingCycle === "yearly" ? "Anual" : "Mensal"}</TableCell><TableCell>{formatDate(item.currentPeriodEnd ?? item.trialEndsAt)}</TableCell><TableCell>{formatDate(item.lastPayment?.paidAt ?? null)}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="Ver detalhes" onClick={()=>setSelected(item)}><Eye className="h-4 w-4" /></Button>{item.status === "trialing" && <Button size="icon" variant="ghost" title="Estender teste em 7 dias" onClick={()=>execute(()=>actions.extendTrial.mutateAsync({id:item.id,days:7}),"Teste estendido em 7 dias.")}><CalendarPlus className="h-4 w-4" /></Button>}{item.status === "suspended" ? <Button size="icon" variant="ghost" title="Reativar" onClick={()=>execute(()=>actions.reactivate.mutateAsync(item.id),"Assinatura reativada.")}><PlayCircle className="h-4 w-4" /></Button> : <Button size="icon" variant="ghost" title="Suspender" onClick={()=>execute(()=>actions.suspend.mutateAsync(item.id),"Assinatura suspensa.")}><PauseCircle className="h-4 w-4" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>{subscriptions.data?.meta.total ?? 0} assinatura(s)</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(page-1)}>Anterior</Button><Button variant="outline" size="sm" disabled={page >= (subscriptions.data?.meta.totalPages ?? 1)} onClick={()=>setPage(page+1)}>Próxima</Button></div></div>
      </CardContent></Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open)=>!open&&setSelected(null)}><DialogContent><DialogHeader><DialogTitle>Detalhes da assinatura</DialogTitle><DialogDescription>Dados contratuais e de uso da conta.</DialogDescription></DialogHeader>{selected && <div className="grid gap-4 text-sm sm:grid-cols-2"><div><p className="text-muted-foreground">Responsável</p><p className="font-medium">{selected.user?.fullName ?? "Conta excluída"}</p></div><div><p className="text-muted-foreground">E-mail</p><p className="font-medium">{selected.user?.email ?? "—"}</p></div><div><p className="text-muted-foreground">Plano</p><p className="font-medium">{selected.plan.name}</p></div><div><p className="text-muted-foreground">Status</p><SubscriptionStatusBadge status={selected.status} /></div><div><p className="text-muted-foreground">Início</p><p className="font-medium">{formatDate(selected.createdAt)}</p></div><div><p className="text-muted-foreground">{selected.plan.code === "trial" ? "Plano gratuito" : "Fim do teste legado"}</p><p className="font-medium">{selected.plan.code === "trial" ? "Sem expiração" : formatDate(selected.trialEndsAt)}</p></div><div className="sm:col-span-2"><p className="mb-2 text-muted-foreground">Alterar plano</p><Select onValueChange={(planCode)=>execute(()=>actions.changePlan.mutateAsync({id:selected.id,planCode}),"Plano alterado.")}><SelectTrigger><SelectValue placeholder="Selecione o novo plano" /></SelectTrigger><SelectContent>{plans.data?.filter((item)=>item.code!==selected.plan.code).map((item)=><SelectItem key={item.id} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select></div></div>}</DialogContent></Dialog>
    </div>
  );
}
