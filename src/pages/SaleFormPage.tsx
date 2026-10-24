import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { SalesShimmer } from "@/components/shimmer/SalesShimmer";
import { useSaleForm } from "@/hooks/use-sale-form";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function SaleFormPage() {
  const { id } = useParams<{ id: string }>();
  const {
    form,
    fields,
    editingSale,
    isLoading,
    isSaving,
    quantityInputs,
    setQuantityInputs,
    addSaleItem,
    updateSaleItem,
    removeSaleItem,
    total,
    costOfGoods,
    profit,
    lineProfit,
    onSubmit,
    cancel,
    startProductCreate,
  } = useSaleForm(id);

  if (isLoading) return <SalesShimmer />;

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex items-start gap-3">
        <Button type="button" variant="outline" size="icon" onClick={cancel} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {editingSale ? "Editar Venda" : "Nova Venda"}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {editingSale
              ? "Atualize os dados da venda"
              : "Adicione os produtos vendidos e veja o lucro antes de finalizar"}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="customer">Cliente (Opcional)</Label>
            <CustomerSelect
              value={form.watch("customerId")}
              onChange={(value) => form.setValue("customerId", value || null)}
              error={form.formState.errors.customerId?.message}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="payment">Forma de Pagamento *</Label>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(value) => form.setValue("paymentMethod", value)}
            >
              <SelectTrigger id="payment" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod && (
              <p className="text-sm text-destructive">
                {form.formState.errors.paymentMethod.message}
              </p>
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="saleDate">Data da Venda *</Label>
            <Input id="saleDate" type="date" {...form.register("saleDate")} error={form.formState.errors.saleDate?.message} />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="saleTime">Hora da Venda *</Label>
            <Input id="saleTime" type="time" {...form.register("saleTime")} error={form.formState.errors.saleTime?.message} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Produtos *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-destructive">Adicione pelo menos um produto à venda</p>
          )}
          {form.formState.errors.items?.message && (
            <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
          )}

          {fields.map((field, index) => {
            const item = form.watch(`items.${index}`);
            const margin = lineProfit(index);
            return (
              <div key={field.id} className="min-w-0 space-y-3 rounded-lg border p-3 sm:p-4">
                <div className="min-w-0 space-y-2">
                  <Label>Produto</Label>
                  <ProductSelect
                    value={item?.productId || ""}
                    onChange={(value) => updateSaleItem(index, "productId", value)}
                    onCreateProduct={() => startProductCreate(index)}
                    error={form.formState.errors.items?.[index]?.productId?.message}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)_auto] sm:items-end">
                  <div className="min-w-0 space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      value={quantityInputs[index] ?? item?.quantity ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setQuantityInputs((prev) => ({ ...prev, [index]: value }));
                        if (value !== "") {
                          const numValue = parseFloat(value);
                          if (!Number.isNaN(numValue) && numValue > 0) {
                            form.setValue(`items.${index}.quantity`, numValue, { shouldValidate: true });
                          }
                        }
                      }}
                      onBlur={(event) => {
                        const numValue = parseFloat(event.target.value);
                        const finalValue = event.target.value === "" || Number.isNaN(numValue) || numValue < 0.01 ? 1 : numValue;
                        form.setValue(`items.${index}.quantity`, finalValue, { shouldValidate: true });
                        setQuantityInputs((prev) => ({ ...prev, [index]: String(finalValue) }));
                      }}
                      className={form.formState.errors.items?.[index]?.quantity ? "border-destructive" : ""}
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label>Preço unitário</Label>
                    <CurrencyInput
                      value={item?.unitPrice || 0}
                      onChange={(value) => updateSaleItem(index, "unitPrice", value || 0)}
                      error={form.formState.errors.items?.[index]?.unitPrice?.message}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSaleItem(index)}
                    aria-label="Remover produto"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {margin && (
                  <p className={`text-sm ${margin.profit >= 0 ? "text-success" : "text-destructive"}`}>
                    Lucro deste item: {money.format(margin.profit)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            {...form.register("notes")}
            rows={3}
            placeholder="Observações sobre a venda..."
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Total da venda</p>
            <p className="break-words text-xl font-bold">{money.format(total)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">CMV</p>
            <p className="break-words text-xl font-bold">{money.format(costOfGoods)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Lucro dos produtos</p>
            <p className={`break-words text-xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
              {money.format(profit)}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={cancel}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingSale ? "Atualizando..." : "Finalizando..."}
              </>
            ) : (
              <>{editingSale ? "Atualizar" : "Finalizar"} Venda</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
