import * as React from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof NumericFormat>, "value" | "onChange"> {
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  error?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const handleValueChange = React.useCallback((values: { floatValue?: number }) => {
      onChange?.(values.floatValue);
    }, [onChange]);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className="w-full">
        <NumericFormat
          {...props}
          getInputRef={inputRef}
          value={value || ""}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          onValueChange={handleValueChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };


