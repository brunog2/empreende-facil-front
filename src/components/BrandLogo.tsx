import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  collapsed?: boolean;
  admin?: boolean;
  tone?: "default" | "inverse";
  className?: string;
}

export function BrandLogo({ collapsed = false, admin = false, tone = "default", className }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/20">
        <TrendingUp className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "truncate font-display text-lg font-bold tracking-tight",
            tone === "inverse" ? "text-white" : "text-current",
          )}
        >
          Gestão <span className="text-primary-500">Pro</span>
          {admin && (
            <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Admin
            </span>
          )}
        </span>
      )}
    </span>
  );
}
