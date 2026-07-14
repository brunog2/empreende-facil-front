import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api";
import { useChangePlan, usePlans } from "../hooks/use-subscriptions";
import { Plan } from "../types/subscription";
import {
  featureLabels,
  featuresForDisplay,
  formatMoney,
} from "../utils/subscription-utils";

const planOrder: Record<string, number> = {
  trial: 0,
  founder: 1,
  starter: 2,
  pro: 3,
  business: 4,
};

function planButtonLabel(plan: Plan): string {
  if (plan.code === "trial") return "Começar teste de 14 dias";
  if (plan.code === "founder") return "Assinar plano Fundador";
  return `Assinar ${plan.name}`;
}

function PlanBadge({ plan }: { plan: Plan }) {
  if (plan.code === "founder") {
    return (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-amber-950 hover:bg-amber-500">
        <Crown className="mr-1 h-3.5 w-3.5" /> Oferta de lançamento
      </Badge>
    );
  }
  if (plan.isRecommended) {
    return (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
        Mais escolhido
      </Badge>
    );
  }
  if (plan.code === "trial") {
    return (
      <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
        Sem cartão
      </Badge>
    );
  }
  return null;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePlans();
  const changePlan = useChangePlan();
  const hasToken = Boolean(localStorage.getItem("accessToken"));
  const sortedPlans = [...(plans ?? [])].sort(
    (left, right) =>
      (planOrder[left.code] ?? 99) - (planOrder[right.code] ?? 99),
  );

  const goBack = () => navigate(hasToken ? "/assinatura" : "/auth");

  const selectPlan = async (plan: Plan) => {
    if (!hasToken) {
      navigate("/auth");
      return;
    }
    if (plan.code === "trial") {
      navigate("/assinatura");
      return;
    }
    try {
      const result = await changePlan.mutateAsync({
        planCode: plan.code,
        billingCycle: "monthly",
      });
      toast.info(result.message);
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else navigate("/assinatura");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <nav className="mb-10 flex items-center justify-between gap-4">
          <Button variant="ghost" className="-ml-3" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {hasToken ? "Voltar para assinatura" : "Voltar para entrar"}
          </Button>
          <button
            className="font-display text-lg font-bold text-primary hover:opacity-80"
            onClick={goBack}
          >
            Gestão Pro
          </button>
        </nav>

        <header className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 max-w-full whitespace-normal text-center">
            <Sparkles className="mr-1 h-3.5 w-3.5 shrink-0" />
            Planos para cada fase do seu negócio
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Escolha o plano ideal para crescer
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Comece com 14 dias grátis, sem cartão. Todos os valores abaixo são mensais.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-[560px] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedPlans.map((plan) => {
              const isFounder = plan.code === "founder";
              const isTrial = plan.code === "trial";
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    plan.isRecommended
                      ? "border-primary shadow-xl shadow-primary/10"
                      : isFounder
                        ? "border-amber-400 bg-amber-50/40 shadow-xl shadow-amber-500/10"
                        : ""
                  }`}
                >
                  <PlanBadge plan={plan} />
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-12 text-sm leading-relaxed">
                      {plan.description}
                    </CardDescription>
                    <div className="pt-4">
                      {isTrial ? (
                        <>
                          <span className="text-4xl font-bold">14 dias</span>
                          <p className="mt-1 text-sm font-medium text-emerald-700">
                            grátis e sem cartão
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            {formatMoney(plan.monthlyPrice)}
                          </span>
                          <span className="text-muted-foreground">/mês</span>
                          {isFounder && (
                            <p className="mt-1 text-sm font-semibold text-amber-700">
                              Condição promocional válida por {plan.durationMonths ?? 3} meses
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-5">
                    <ul className="space-y-3">
                      {featuresForDisplay(plan.features).map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          {featureLabels[feature]}
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-1 border-t pt-4 text-sm text-muted-foreground">
                      <p>
                        {plan.limits.products === null
                          ? "Produtos ilimitados"
                          : `Até ${plan.limits.products.toLocaleString("pt-BR")} produtos`}
                      </p>
                      <p>
                        {plan.limits.customers === null
                          ? "Clientes ilimitados"
                          : `Até ${plan.limits.customers.toLocaleString("pt-BR")} clientes`}
                      </p>
                      <p>
                        {plan.limits.salesPerMonth === null
                          ? "Vendas ilimitadas"
                          : `Até ${plan.limits.salesPerMonth.toLocaleString("pt-BR")} vendas/mês`}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.isRecommended || isFounder ? "default" : "outline"}
                      disabled={changePlan.isPending}
                      onClick={() => selectPlan(plan)}
                    >
                      {planButtonLabel(plan)}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
