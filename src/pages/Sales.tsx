import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { SalesShimmer } from "@/components/shimmer/SalesShimmer";
import { format } from "date-fns";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useSalesPage } from "@/hooks/use-sales-page";

export default function Sales() {
  const {
    sales,
    products,
    editingSale,
    isLoading,
    form,
    fields,
    addSaleItem,
    updateSaleItem,
    removeSaleItem,
    calculateTotal,
    onSubmit,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleDeleteClick,
    handleConfirmDelete,
    deleteSale,
    createSale,
    updateSale,
  } = useSalesPage();

  // Estado local para valores temporários dos inputs de quantidade
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>(
    {}
  );

  // Sincronizar valores do form com o estado local quando o dialog abre ou campos são adicionados
  useEffect(() => {
    if (!dialogOpen) {
      setQuantityInputs({});
      return;
    }

    setQuantityInputs((prev) => {
      const newValues: Record<number, string> = { ...prev };
      fields.forEach((_, index) => {
        // Só inicializa se não existir no estado local
        if (newValues[index] === undefined) {
          const item = form.getValues(`items.${index}`);
          if (item?.quantity !== undefined) {
            newValues[index] = item.quantity.toString();
          } else {
            newValues[index] = "1";
          }
        }
      });
      return newValues;
    });
  }, [fields.length, dialogOpen, form]);

  if (isLoading) {
    return <SalesShimmer />;
  }

  return (
    <div
      className="space-y-4 md:space-y-6 p-4 md:p-6 w-full"
      style={{ maxWidth: "100vw", boxSizing: "border-box" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Vendas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Registre e acompanhe suas vendas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto z-50 w-full">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? "Editar Venda" : "Nova Venda"}
              </DialogTitle>
              <DialogDescription>
                {editingSale
                  ? "Atualize os dados da venda"
                  : "Adicione os produtos vendidos"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente (Opcional)</Label>
                  <CustomerSelect
                    value={form.watch("customerId")}
                    onChange={(value) =>
                      form.setValue("customerId", value || null)
                    }
                    error={form.formState.errors.customerId?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Forma de Pagamento *</Label>
                  <Select
                    value={form.watch("paymentMethod")}
                    onValueChange={(value) =>
                      form.setValue("paymentMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="cartao_debito">
                        Cartão de Débito
                      </SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.paymentMethod.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleDate">Data da Venda *</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    {...form.register("saleDate")}
                    error={form.formState.errors.saleDate?.message}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Produtos *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSaleItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-destructive">
                    Adicione pelo menos um produto à venda
                  </p>
                )}

                {fields.map((field, index) => {
                  const item = form.watch(`items.${index}`);
                  const product = products.find(
                    (p) => p.id === item?.productId
                  );
                  const isOutOfStock = product && product.stockQuantity <= 0;
                  const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;

                  return (
                    <div
                      key={field.id}
                      className="flex sm:flex-row gap-2 items-end p-4 border rounded-lg"
                    >
                      <div className="flex-1 w-full space-y-2">
                        <Label>Produto</Label>
                        <ProductSelect
                          value={item?.productId || ""}
                          onChange={(value) =>
                            updateSaleItem(index, "productId", value)
                          }
                          error={
                            form.formState.errors.items?.[index]?.productId
                              ?.message
                          }
                        />
                        {isOutOfStock && (
                          <p className="text-sm text-destructive mt-1">
                            Produto sem estoque
                          </p>
                        )}
                      </div>
                      <div className="w-full sm:w-24 space-y-2">
                        <Label>Qtd</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={quantityInputs[index] ?? item?.quantity ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Atualiza o estado local imediatamente (permite valores vazios)
                            setQuantityInputs((prev) => ({
                              ...prev,
                              [index]: value,
                            }));
                            // Atualiza o form apenas se o valor for válido
                            if (value !== "") {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue > 0) {
                                form.setValue(
                                  `items.${index}.quantity` as any,
                                  numValue,
                                  { shouldValidate: true }
                                );
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value);
                            const finalValue =
                              value === "" || isNaN(numValue) || numValue < 0.01
                                ? 1
                                : numValue;
                            // Atualiza o form e o estado local
                            form.setValue(
                              `items.${index}.quantity` as any,
                              finalValue,
                              { shouldValidate: true }
                            );
                            setQuantityInputs((prev) => ({
                              ...prev,
                              [index]: finalValue.toString(),
                            }));
                          }}
                          className={
                            form.formState.errors.items?.[index]?.quantity
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {form.formState.errors.items?.[index]?.quantity && (
                          <p className="text-sm text-destructive mt-1">
                            {
                              form.formState.errors.items[index]?.quantity
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="w-full sm:w-40 space-y-2">
                        <Label>Preço Unit.</Label>
                        <CurrencyInput
                          value={unitPrice}
                          onChange={(value) => {
                            form.setValue(
                              `items.${index}.unitPrice`,
                              value || 0,
                              { shouldValidate: true }
                            );
                          }}
                          error={
                            form.formState.errors.items?.[index]?.unitPrice
                              ?.message
                          }
                        />
                      </div>
                      <div className="flex items-center h-[2.5rem]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSaleItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  rows={3}
                  placeholder="Observações sobre a venda..."
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateTotal())}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createSale.isPending || updateSale.isPending}
                >
                  {createSale.isPending || updateSale.isPending ? (
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
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            {sales.length} venda(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {sales.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-6">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 sm:px-0">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => {
                    const profit = sale.saleItems.reduce((sum, item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );
                      const cost = product?.costPrice || 0;
                      return sum + (item.unitPrice - cost) * item.quantity;
                    }, 0);

                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.saleDate), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {sale.customer?.name || "Cliente não informado"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {sale.saleItems.map((item, idx) => {
                              const product = products.find(
                                (p) => p.id === item.productId
                              );
                              return (
                                <div key={idx} className="text-sm">
                                  {product?.name || "Produto desconhecido"} x{" "}
                                  {item.quantity}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {sale.paymentMethod?.replace("_", " ") || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(sale.totalAmount)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            profit >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(sale.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(sale.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser
              desfeita e o estoque dos produtos será restaurado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSale.isPending}
            >
              {deleteSale.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
