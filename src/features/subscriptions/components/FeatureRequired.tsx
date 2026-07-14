import { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-auth";
import { useSubscription } from "../context/SubscriptionProvider";
import { PlanFeature } from "../types/subscription";
import { featureLabels } from "../utils/subscription-utils";

export function FeatureRequired({
  feature,
  children,
}: {
  feature: PlanFeature;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { canAccessFeature } = useSubscription();
  if (user?.role === "admin" || canAccessFeature(feature)) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center p-6">
      <Card className="w-full border-primary/20 text-center shadow-sm">
        <CardHeader>
          <div className="mx-auto mb-2 rounded-full bg-primary/10 p-3 text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle>Recurso disponível em outro plano</CardTitle>
          <CardDescription>
            O recurso {featureLabels[feature]} não está incluído no seu plano atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/planos")}>Conhecer outros planos</Button>
        </CardContent>
      </Card>
    </div>
  );
}
