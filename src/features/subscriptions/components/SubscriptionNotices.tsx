import { AlertTriangle, Clock3, Gauge } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from "../context/SubscriptionProvider";
import { daysUntil, usagePercentage } from "../utils/subscription-utils";

export function SubscriptionNotices() {
  const { subscription, usage } = useSubscription();
  if (!subscription) return null;

  const notices: Array<{ title: string; description: string; icon: typeof Clock3 }> = [];
  const trialDays = daysUntil(subscription.trialEndsAt);
  if (subscription.status === "trialing" && trialDays !== null && [7, 3, 1].includes(trialDays)) {
    notices.push({
      title: "Seu teste está terminando",
      description: `Seu período de teste termina em ${trialDays} ${trialDays === 1 ? "dia" : "dias"}. Escolha um plano para continuar utilizando o Gestão Pro.`,
      icon: Clock3,
    });
  }
  const promotionalDays = daysUntil(subscription.planAccessEndsAt);
  if (promotionalDays !== null && [7, 3, 1].includes(promotionalDays)) {
    notices.push({
      title: "Sua condição promocional está terminando",
      description: `O acesso promocional termina em ${promotionalDays} ${promotionalDays === 1 ? "dia" : "dias"}. Escolha um dos planos disponíveis para não interromper a operação.`,
      icon: Clock3,
    });
  }
  if (subscription.status === "past_due") {
    notices.push({
      title: "Pagamento atrasado",
      description: "Não conseguimos confirmar o pagamento da sua assinatura. Regularize o pagamento para evitar a suspensão do acesso.",
      icon: AlertTriangle,
    });
  }
  if (usage) {
    const nearLimit = Object.entries(usage).find(([, item]) =>
      item.limit !== null && usagePercentage(item.current, item.limit) >= 80,
    );
    if (nearLimit) {
      const labels = { products: "produtos", customers: "clientes", salesPerMonth: "vendas mensais" };
      notices.push({
        title: "Limite do plano próximo",
        description: `Você já utilizou pelo menos 80% do limite de ${labels[nearLimit[0] as keyof typeof labels]}.`,
        icon: Gauge,
      });
    }
  }

  if (!notices.length) return null;
  return (
    <div className="space-y-2 px-4 pt-4 md:px-6">
      {notices.map((notice) => (
        <Alert key={notice.title} className="border-amber-200 bg-amber-50 text-amber-950">
          <notice.icon className="h-4 w-4" />
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
