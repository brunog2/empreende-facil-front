import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
  error?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, error, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value?.toString() || "");

    const formatPhone = (input: string): string => {
      // Remove tudo que não é número
      const numbers = input.replace(/\D/g, "");

      // Aplica a máscara (00) 00000-0000 ou (00) 0000-0000
      if (numbers.length <= 2) {
        return numbers ? `(${numbers}` : "";
      } else if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatPhone(inputValue);
      setValue(formatted);
      
      if (onChange) {
        // Retorna apenas os números para o onChange
        const numbers = formatted.replace(/\D/g, "");
        onChange(numbers);
      }
    };

    React.useEffect(() => {
      if (props.value !== undefined) {
        const formatted = formatPhone(props.value.toString());
        setValue(formatted);
      }
    }, [props.value]);

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="(00) 00000-0000"
        maxLength={15}
        className={cn(className)}
        error={error}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };


