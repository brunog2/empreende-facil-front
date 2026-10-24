import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Loader2, Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SalesShimmer } from "@/components/shimmer/SalesShimmer";
import { format } from "date-fns";
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
  formatStr: string = "dd/MM/yyyy HH:mm",
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
        timeMatch[3] ? parseInt(timeMatch[3]) : 0,
      );
    }
  }

  return format(date, formatStr);
};

export default function Sales() {
  const {
    sales,
    products,
    isLoading,
    paginationMeta,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteDialogOpen,
    setDeleteDialogOpen,
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
  } = useSalesPage();

  const navigate = useNavigate();

  if (isLoading) {
    return <SalesShimmer />;
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Vendas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Registre e acompanhe suas vendas
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate("/vendas/nova")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
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
                  type="search"
                  inputMode="search"
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
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
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
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden lg:table-cell">Produtos</TableHead>
                    <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden text-right md:table-cell">Margem bruta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => {
                    const grossMargin = sale.saleItems.reduce((sum, item) => {
                      return (
                        sum +
                        (item.unitPrice - Number(item.productCostPrice)) *
                          item.quantity
                      );
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
                        <TableCell className="hidden md:table-cell">
                          {sale.customer?.name || "Cliente não informado"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
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
                        <TableCell className="hidden capitalize md:table-cell">
                          {sale.paymentMethod?.replace("_", " ") || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(sale.totalAmount)}
                        </TableCell>
                        <TableCell
                          className={`hidden text-right font-medium md:table-cell ${
                            grossMargin >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(grossMargin)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5 [&_button]:h-8 [&_button]:w-8">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/vendas/${sale.id}/editar`)}
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
            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
                      Math.min(paginationMeta.totalPages, prev + 1),
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
