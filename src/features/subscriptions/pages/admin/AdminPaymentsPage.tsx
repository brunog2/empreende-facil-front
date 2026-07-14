import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminPayments } from "../../hooks/use-subscriptions";
import { PaymentStatus } from "../../types/subscription";
import { formatDate, formatMoney, paymentStatusLabels } from "../../utils/subscription-utils";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const payments = useAdminPayments({ search: search || undefined, status: status === "all" ? undefined : status, limit: 50 });
  return (
    <div className="space-y-6 p-4 md:p-6"><div><h1 className="font-display text-3xl font-bold">Pagamentos</h1><p className="text-muted-foreground">Histórico financeiro confirmado pelos provedores.</p></div><Card><CardHeader><CardTitle>Movimentações</CardTitle><div className="grid gap-3 pt-3 sm:grid-cols-2"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Responsável ou e-mail" value={search} onChange={(e)=>setSearch(e.target.value)} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{(["pending","processing","paid","failed","refunded","canceled"] as PaymentStatus[]).map((value)=><SelectItem key={value} value={value}>{paymentStatusLabels[value]}</SelectItem>)}</SelectContent></Select></div></CardHeader><CardContent>{payments.isLoading ? <div className="space-y-2">{[1,2,3].map((i)=><Skeleton key={i} className="h-14" />)}</div> : payments.data?.data.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Conta</TableHead><TableHead>Plano</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead>Vencimento</TableHead><TableHead>Pagamento</TableHead><TableHead>Criado em</TableHead></TableRow></TableHeader><TableBody>{payments.data.data.map((payment)=><TableRow key={payment.id}><TableCell><p className="font-medium">{payment.subscription.user?.fullName ?? "Conta excluída"}</p><p className="text-xs text-muted-foreground">{payment.subscription.user?.email ?? "—"}</p></TableCell><TableCell>{payment.subscription.plan.name}</TableCell><TableCell>{formatMoney(payment.amount)}</TableCell><TableCell>{paymentStatusLabels[payment.status]}</TableCell><TableCell>{formatDate(payment.dueDate)}</TableCell><TableCell>{formatDate(payment.paidAt)}</TableCell><TableCell>{formatDate(payment.createdAt)}</TableCell></TableRow>)}</TableBody></Table></div> : <div className="py-12 text-center text-muted-foreground">Nenhum pagamento encontrado.</div>}</CardContent></Card></div>
  );
}
