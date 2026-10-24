import * as React from "react";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { passwordRules } from "@/lib/password";

interface PasswordFieldProps extends InputProps {
  tips?: boolean;
  passwordValue?: string;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ tips = false, passwordValue = "", className, error, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            error={error}
            {...props}
            type={visible ? "text" : "password"}
            className={cn("pr-10", className)}
          />
          <button
            type="button"
            className="absolute right-1 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {tips && (
          <ul className="space-y-1">
            {passwordRules.map((rule) => {
              const met = rule.test(passwordValue);
              return (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    met ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {met ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
PasswordField.displayName = "PasswordField";

export { PasswordField };
