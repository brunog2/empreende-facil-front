import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-auth";
import { useSubscription } from "../context/SubscriptionProvider";

export function SubscriptionRequired({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const { isLoading, isSubscriptionBlocked } = useSubscription();

  if (user?.role === "admin") return <>{children}</>;
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Consultando assinatura</span>
      </div>
    );
  }
  if (isSubscriptionBlocked && location.pathname !== "/assinatura") {
    return <Navigate to="/assinatura" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
