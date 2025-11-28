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
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Loader2, Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SalesShimmer } from "@/components/shimmer/SalesShimmer";
import { format } from "date-fns";
import { CustomerSelect } from "@/components/CustomerSelect";
import { ProductSelect } from "@/components/ProductSelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useSalesPage } from "@/hooks/use-sales-page";

// Helper para extrair apenas a data (YYYY-MM-DD) de uma string ISO, ignorando timezone
const extractDateOnly = (isoString: string): string => {
  // Se a string já está no formato YYYY-MM-DD, retorna direto
  if (isoString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return isoString;
  }
  // Extrai apenas a parte da data (YYYY-MM-DD) da string ISO
  return isoString.split("T")[0];
};

// Helper para formatar data de venda corretamente, ignorando problemas de timezone
const formatSaleDate = (
  isoString: string,
  formatStr: string = "dd/MM/yyyy HH:mm"
): string => {
  // Extrair apenas a data (YYYY-MM-DD) da string ISO
  const dateStr = extractDateOnly(isoString);
  const [year, month, day] = dateStr.split("-").map(Number);

  // Criar data no timezone local
  const date = new Date(year, month - 1, day);

  // Se o formato inclui hora, tentar extrair da string original
  if (formatStr.includes("HH:mm") || formatStr.includes("HH:mm:ss")) {
    const timeMatch = isoString.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      date.setHours(
        parseInt(timeMatch[1]),
        parseInt(timeMatch[2]),
        timeMatch[3] ? parseInt(timeMatch[3]) : 0
      );
    }
  }

  return format(date, formatStr);
};

export default function Sales() {
  const {
    sales,
    products,
    editingSale,
    isLoading,
    paginationMeta,
    currentPage,
    setCurrentPage,
    pageSize,
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
    selectedSales,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteSales,
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,
    createSale,
    updateSale,
  } = useSalesPage();

  const navigate = useNavigate();

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
          <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] sm:min-h-[640px] flex flex-col p-0 sm:p-6">
            <DialogHeader className="flex-shrink-0 px-3 pt-3 sm:px-0 sm:pt-0">
              <DialogTitle>
                {editingSale ? "Editar Venda" : "Nova Venda"}
              </DialogTitle>
              <DialogDescription>
                {editingSale
                  ? "Atualize os dados da venda"
                  : "Adicione os produtos vendidos"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-[400px] overflow-y-auto px-3 sm:px-0 pb-20 sm:pb-0">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
                id="sale-form"
              >
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="saleTime">Hora da Venda *</Label>
                    <Input
                      id="saleTime"
                      type="time"
                      {...form.register("saleTime")}
                      error={form.formState.errors.saleTime?.message}
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
                    const unitPrice =
                      form.watch(`items.${index}.unitPrice`) || 0;

                    return (
                      <div
                        key={field.id}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-end p-3 sm:p-4 border rounded-lg"
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
                        <div className="w-full sm:w-28 space-y-2">
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={
                              quantityInputs[index] ?? item?.quantity ?? ""
                            }
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
                                value === "" ||
                                isNaN(numValue) ||
                                numValue < 0.01
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
                        <div className="flex items-center justify-end sm:justify-start h-[2.5rem] sm:h-auto">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSaleItem(index)}
                            className="sm:mt-0"
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
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 bg-muted/50">
                  <span className="font-semibold text-sm sm:text-base">
                    Total:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(calculateTotal())}
                  </span>
                </div>
              </form>
            </div>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4 border-t mt-2 sm:mt-0 px-3 pb-3 sm:px-0 sm:pb-0 bg-background sm:bg-transparent sticky bottom-0 sm:static z-10">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="sale-form"
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
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                1
              </span>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Produto ou cliente..."
                  {...filtersForm.register("searchTerm")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...filtersForm.register("startDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...filtersForm.register("endDate")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                {paginationMeta
                  ? `${paginationMeta.total} venda(s) encontrada(s) - Página ${paginationMeta.page} de ${paginationMeta.totalPages}`
                  : `${sales.length} venda(s) registrada(s)`}
                {hasActiveFilters && " (filtros aplicados)"}
              </CardDescription>
            </div>
            {selectedSales.size > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="destructive"
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDeleteSales.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir {selectedSales.size} selecionada(s)
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSelection}
                  className="h-9 w-9"
                  title="Cancelar seleção"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          sales.length > 0 &&
                          selectedSales.size === sales.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
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
                          <Checkbox
                            checked={selectedSales.has(sale.id)}
                            onCheckedChange={() => toggleSelect(sale.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {formatSaleDate(sale.saleDate, "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {sale.customer?.name || "Cliente não informado"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {sale.saleItems.map((item, idx) => {
                              const product = item.productId
                                ? products.find((p) => p.id === item.productId)
                                : null;
                              const productName =
                                item.productName ||
                                product?.name ||
                                "Produto desconhecido";
                              return (
                                <div key={idx} className="text-sm">
                                  {item.productId ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        navigate(`/produtos/${item.productId}`)
                                      }
                                      className="text-primary hover:underline font-medium"
                                    >
                                      {productName}
                                    </button>
                                  ) : (
                                    <span>{productName}</span>
                                  )}{" "}
                                  x {item.quantity}
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
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                {Math.min(currentPage * pageSize, paginationMeta.total)} de{" "}
                {paginationMeta.total} vendas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {paginationMeta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(paginationMeta.totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === paginationMeta.totalPages}
                >
                  Próxima
                </Button>
              </div>
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

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedSales.size} venda(s)? Esta
              ação não pode ser desfeita e o estoque dos produtos será
              restaurado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteSales.isPending}
            >
              {bulkDeleteSales.isPending ? (
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
