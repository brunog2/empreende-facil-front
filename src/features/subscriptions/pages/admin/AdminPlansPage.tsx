import { useState } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";
import { useAdminPlanMutations, useAdminPlans } from "../../hooks/use-subscriptions";
import { planFormSchema } from "../../schemas/plan-schema";
import { Plan, PlanFeature } from "../../types/subscription";
import { featureLabels, featureOrder, formatMoney } from "../../utils/subscription-utils";

type PlanDraft = Omit<Plan, "id" | "createdAt" | "updatedAt">;
const features: PlanFeature[] = featureOrder;

function blankPlan(): PlanDraft {
  return {
    code: "",
    name: "",
    description: "",
    monthlyPrice: "0.00",
    yearlyPrice: "0.00",
    trialDays: null,
    durationMonths: null,
    features: {
      dashboard: true,
      sales: true,
      products: true,
      categories: true,
      customers: true,
      expenses: true,
      reports: true,
      advancedReports: false,
      dataExport: false,
      automaticBackup: false,
      prioritySupport: false,
      premiumSupport: false,
    },
    limits: { products: 100, customers: 100, salesPerMonth: 300 },
    isActive: true,
    isRecommended: false,
  };
}

export default function AdminPlansPage() {
  const plans = useAdminPlans();
  const mutations = useAdminPlanMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);

  const openCreate = () => { setEditingId(null); setDraft(blankPlan()); };
  const openEdit = (plan: Plan) => {
    const { id, createdAt, updatedAt, ...data } = plan;
    setEditingId(id);
    setDraft(data);
  };
  const save = async () => {
    if (!draft) return;
    const parsed = planFormSchema.safeParse(draft);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Revise os campos do plano."); return; }
    try {
      if (editingId) await mutations.update.mutateAsync({ id: editingId, data: draft });
      else await mutations.create.mutateAsync(draft);
      toast.success(editingId ? "Plano atualizado." : "Plano criado.");
      setDraft(null);
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-3xl font-bold">Planos</h1><p className="text-muted-foreground">Preços, módulos e limites são centralizados no banco.</p></div><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Novo plano</Button></div>
      <div className="grid gap-5 lg:grid-cols-3">{plans.data?.map((plan)=><Card key={plan.id} className={plan.isRecommended ? "border-primary" : ""}><CardHeader><div className="flex items-start justify-between"><div><CardTitle>{plan.name}</CardTitle><CardDescription className="mt-1">{plan.code}</CardDescription></div><span className={`rounded-full px-2 py-1 text-xs ${plan.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{plan.isActive ? "Ativo" : "Inativo"}</span></div><p className="pt-2 text-sm text-muted-foreground">{plan.description}</p></CardHeader><CardContent className="space-y-4"><div><span className="text-3xl font-bold">{formatMoney(plan.monthlyPrice)}</span><span className="text-muted-foreground">/mês</span><p className="text-sm text-muted-foreground">{formatMoney(plan.yearlyPrice)}/ano</p>{plan.durationMonths && <p className="text-sm font-medium text-amber-700">Acesso promocional: {plan.durationMonths} meses</p>}</div><ul className="space-y-2 text-sm">{features.filter((feature)=>plan.features[feature]).map((feature)=><li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" />{featureLabels[feature]}</li>)}</ul><div className="border-t pt-3 text-sm text-muted-foreground"><p>Produtos: {plan.limits.products ?? "ilimitado"}</p><p>Clientes: {plan.limits.customers ?? "ilimitado"}</p><p>Vendas/mês: {plan.limits.salesPerMonth ?? "ilimitado"}</p></div></CardContent><CardFooter><Button className="w-full" variant="outline" onClick={()=>openEdit(plan)}><Pencil className="mr-2 h-4 w-4" />Editar plano</Button></CardFooter></Card>)}</div>

      <Dialog open={Boolean(draft)} onOpenChange={(open)=>!open&&setDraft(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{editingId ? "Editar plano" : "Novo plano"}</DialogTitle><DialogDescription>Altere valores e regras que serão validados novamente pelo back-end.</DialogDescription></DialogHeader>{draft && <div className="grid gap-5 py-2 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="plan-code">Código</Label><Input id="plan-code" value={draft.code} disabled={Boolean(editingId)} onChange={(e)=>setDraft({...draft,code:e.target.value})} /></div><div className="space-y-2"><Label htmlFor="plan-name">Nome</Label><Input id="plan-name" value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="plan-description">Descrição</Label><Textarea id="plan-description" value={draft.description} onChange={(e)=>setDraft({...draft,description:e.target.value})} /></div><div className="space-y-2"><Label htmlFor="monthly">Preço mensal</Label><Input id="monthly" inputMode="decimal" value={draft.monthlyPrice} onChange={(e)=>setDraft({...draft,monthlyPrice:e.target.value.replace(",",".")})} /></div><div className="space-y-2"><Label htmlFor="yearly">Preço anual</Label><Input id="yearly" inputMode="decimal" value={draft.yearlyPrice} onChange={(e)=>setDraft({...draft,yearlyPrice:e.target.value.replace(",",".")})} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="duration-months">Duração promocional em meses (vazio = contínuo)</Label><Input id="duration-months" type="number" min="1" max="120" value={draft.durationMonths ?? ""} onChange={(e)=>setDraft({...draft,durationMonths:e.target.value===""?null:Number(e.target.value)})} /></div><div className="space-y-3 sm:col-span-2"><Label>Módulos incluídos</Label><div className="grid gap-3 sm:grid-cols-2">{features.map((feature)=><label key={feature} className="flex items-center gap-2 rounded-md border p-3 text-sm"><Checkbox checked={draft.features[feature]} onCheckedChange={(checked)=>setDraft({...draft,features:{...draft.features,[feature]:Boolean(checked)}})} />{featureLabels[feature]}</label>)}</div></div><div className="space-y-3 sm:col-span-2"><Label>Limites (vazio = ilimitado)</Label><div className="grid gap-3 sm:grid-cols-3">{(["products","customers","salesPerMonth"] as const).map((limit)=><div key={limit} className="space-y-1"><Label className="text-xs" htmlFor={`limit-${limit}`}>{limit}</Label><Input id={`limit-${limit}`} type="number" min="0" value={draft.limits[limit] ?? ""} onChange={(e)=>setDraft({...draft,limits:{...draft.limits,[limit]:e.target.value===""?null:Number(e.target.value)}})} /></div>)}</div></div><label className="flex items-center justify-between rounded-md border p-3"><span className="text-sm font-medium">Disponível para contratação</span><Switch checked={draft.isActive} onCheckedChange={(checked)=>setDraft({...draft,isActive:checked})} /></label><label className="flex items-center justify-between rounded-md border p-3"><span className="text-sm font-medium">Plano recomendado</span><Switch checked={draft.isRecommended} onCheckedChange={(checked)=>setDraft({...draft,isRecommended:checked})} /></label></div>}<DialogFooter><Button variant="outline" onClick={()=>setDraft(null)}>Cancelar</Button><Button onClick={save} disabled={mutations.create.isPending||mutations.update.isPending}>Salvar plano</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
