import { useState } from "react";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategorySelect } from "@/components/CategorySelect";
import { CurrencyInput } from "@/components/ui/currency-input";

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  category: z.string().optional().nullable(),
  costPrice: z.coerce.number().min(0, "O preço de custo deve ser maior ou igual a zero"),
  salePrice: z.coerce.number().min(0, "O preço de venda deve ser maior ou igual a zero"),
  stockQuantity: z.coerce.number().min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ProductSelect({ value, onChange, error }: ProductSelectProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: null,
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
    },
  });

  const handleCreateProduct = async (data: ProductFormData, e?: React.BaseSyntheticEvent) => {
    // Prevenir propagação do evento para não submeter formulários pais
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const newProduct = await createProduct.mutateAsync({
        name: data.name,
        category: data.category || null,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        stockQuantity: data.stockQuantity,
      });
      onChange(newProduct.id);
      setCreateDialogOpen(false);
      form.reset();
      setOpen(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const selectedProduct = products.find((p) => p.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedProduct
              ? `${selectedProduct.name} ${selectedProduct.stockQuantity <= 0 ? "(Sem estoque)" : `(Estoque: ${selectedProduct.stockQuantity.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3,
              })})`}`
              : "Selecione um produto"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-[60]" align="start">
          <Command>
            <CommandInput placeholder="Buscar produto..." />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="mb-2">Nenhum produto encontrado.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar novo produto
                  </Button>
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
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product.name} {isOutOfStock ? "(Sem estoque)" : `(Estoque: ${product.stockQuantity.toLocaleString('pt-BR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 3,
                      })})`}
                    </CommandItem>
                  );
                })}
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar novo produto
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        // Só permite fechar se não estiver em processo de criação
        if (!createProduct.isPending) {
          setCreateDialogOpen(open);
        }
      }}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto z-[55]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Previne fechamento ao clicar fora quando está dentro de outro Dialog
            // Verifica se há outro Dialog aberto (z-index maior)
            const dialogs = document.querySelectorAll('[role="dialog"]');
            if (dialogs.length > 1) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Permite fechar com ESC apenas se não estiver criando
            if (createProduct.isPending) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Crie um novo produto rapidamente
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(handleCreateProduct)(e);
            }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome do Produto *</Label>
              <Input
                id="product-name"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Categoria</Label>
              <CategorySelect
                value={form.watch("category") || null}
                onChange={(value) => form.setValue("category", value || null, { shouldValidate: true })}
                error={form.formState.errors.category?.message}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-cost-price">Preço de Custo *</Label>
                <CurrencyInput
                  value={form.watch("costPrice")}
                  onChange={(value) => form.setValue("costPrice", value || 0, { shouldValidate: true })}
                  error={form.formState.errors.costPrice?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sale-price">Preço de Venda *</Label>
                <CurrencyInput
                  value={form.watch("salePrice")}
                  onChange={(value) => form.setValue("salePrice", value || 0, { shouldValidate: true })}
                  error={form.formState.errors.salePrice?.message}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Quantidade em Estoque *</Label>
              <Input
                id="product-stock"
                type="number"
                step="0.01"
                min="0"
                {...form.register("stockQuantity", { valueAsNumber: true })}
                error={form.formState.errors.stockQuantity?.message}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? (
                  <>
                    <Plus className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Produto
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

