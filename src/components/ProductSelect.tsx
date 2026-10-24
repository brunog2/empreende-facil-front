import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  onCreateProduct?: () => void;
}

function stockLabel(quantity: number) {
  if (quantity <= 0) return "(Sem estoque)";
  return `(Estoque: ${quantity.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })})`;
}

export function ProductSelect({ value, onChange, error, onCreateProduct }: ProductSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: products = [] } = useProducts();
  const selectedProduct = products.find((product) => product.id === value);

  const createProduct = () => {
    setOpen(false);
    onCreateProduct?.();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full min-w-0 justify-between",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <span className="truncate">
              {selectedProduct
                ? `${selectedProduct.name} ${stockLabel(selectedProduct.stockQuantity)}`
                : "Selecione um produto"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar produto..." />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="mb-2">Nenhum produto encontrado.</p>
                  {onCreateProduct && (
                    <Button variant="outline" size="sm" type="button" onClick={createProduct}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar novo produto
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {products.map((product) => {
                  const isOutOfStock = product.stockQuantity <= 0;
                  return (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      disabled={isOutOfStock}
                      onSelect={() => {
                        if (!isOutOfStock) {
                          onChange(product.id);
                          setOpen(false);
                        }
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === product.id ? "opacity-100" : "opacity-0")} />
                      <span className="min-w-0 break-words">
                        {product.name} {stockLabel(product.stockQuantity)}
                      </span>
                    </CommandItem>
                  );
                })}
                {onCreateProduct && (
                  <CommandItem onSelect={createProduct} className="text-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar novo produto
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </>
  );
}
