import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelect } from "@/components/CategorySelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateProduct } from "@/hooks/use-products";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional().nullable(),
  costPrice: z.coerce.number().min(0, "O preço de custo deve ser maior ou igual a zero"),
  salePrice: z.coerce.number().min(0, "O preço de venda deve ser maior ou igual a zero"),
  stockQuantity: z.coerce.number().min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retorno = searchParams.get("retorno");
  const createProduct = useCreateProduct();
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: null,
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
    },
  });

  const goBack = () => {
    if (retorno) {
      navigate(`${retorno}?rascunho=1`);
      return;
    }
    navigate("/produtos");
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const product = await createProduct.mutateAsync({
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        stockQuantity: data.stockQuantity,
      });
      if (retorno) {
        navigate(`${retorno}?produto=${product.id}`);
        return;
      }
      navigate("/produtos");
    } catch {
      // O hook de produto já mostra o erro.
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex items-start gap-3">
        <Button type="button" variant="outline" size="icon" onClick={goBack} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Novo Produto</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Preencha os dados do produto. O preço de custo entra no lucro da venda.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="product-name">Nome do Produto *</Label>
          <Input id="product-name" type="text" autoComplete="off" {...form.register("name")} error={form.formState.errors.name?.message} />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="product-category">Categoria</Label>
          <CategorySelect
            value={form.watch("category") || null}
            onChange={(value) => form.setValue("category", value || null, { shouldValidate: true })}
            error={form.formState.errors.category?.message}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="product-description">Descrição</Label>
          <Textarea id="product-description" rows={3} placeholder="Descreva o produto..." className="resize-none" {...form.register("description")} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="product-cost-price">Preço de Custo *</Label>
            <CurrencyInput
              id="product-cost-price"
              value={form.watch("costPrice")}
              onChange={(value) => form.setValue("costPrice", value || 0, { shouldValidate: true })}
              error={form.formState.errors.costPrice?.message}
            />
            <p className="text-xs text-muted-foreground">
              Se a matéria-prima já foi lançada em Despesas, não inclua esse valor aqui. Coloque só os outros custos deste produto.
            </p>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="product-sale-price">Preço de Venda *</Label>
            <CurrencyInput
              id="product-sale-price"
              value={form.watch("salePrice")}
              onChange={(value) => form.setValue("salePrice", value || 0, { shouldValidate: true })}
              error={form.formState.errors.salePrice?.message}
            />
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="product-stock">Quantidade em Estoque *</Label>
          <Input
            id="product-stock"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            {...form.register("stockQuantity", { valueAsNumber: true })}
            error={form.formState.errors.stockQuantity?.message}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBack}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={createProduct.isPending}>
            {createProduct.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Produto"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
