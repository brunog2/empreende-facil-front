import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  ArrowUpDown,
  Filter,
  X,
  Minus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsShimmer } from "@/components/shimmer/ProductsShimmer";
import { CategorySelect } from "@/components/CategorySelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSelectSearchable } from "@/components/ui/multi-select-searchable";
import { useProductsPage } from "@/hooks/use-products-page";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    products,
    allProducts,
    categories,
    editingProduct,
    isLoading,
    paginationMeta,
    currentPage,
    setCurrentPage,
    pageSize,
    form,
    onSubmit,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    stockDialogOpen,
    setStockDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    productForStock,
    stockForm,
    handleOpenStockDialog,
    handleCloseStockDialog,
    handleConfirmStockAdjustment,
    handleDeleteClick,
    handleConfirmDelete,
    deleteProduct,
    selectedProducts,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteProducts,
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,
    createProduct,
    updateProduct,
  } = useProductsPage();

  // Abrir modal de edição se productId estiver na URL
  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId && !dialogOpen && !isLoading) {
      // Verificar se o produto está na página atual
      const product = products.find((p) => p.id === productId);
      if (product) {
        handleOpenDialog(productId);
        // Remover productId da URL após abrir
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("productId");
        setSearchParams(newParams, { replace: true });
      } else {
        // Se não estiver na página atual, apenas remover o param
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("productId");
        setSearchParams(newParams, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, products, dialogOpen, isLoading]);

  if (isLoading) {
    return <ProductsShimmer />;
  }

  return (
    <div
      className="space-y-4 md:space-y-6 p-4 md:p-6 w-full"
      style={{ maxWidth: "100vw", boxSizing: "border-box" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu estoque e produtos
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do produto abaixo
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      error={form.formState.errors.name?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <CategorySelect
                      value={form.watch("category")}
                      onChange={(value) => form.setValue("category", value)}
                      error={form.formState.errors.category?.message}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={3}
                    placeholder="Descreva o produto..."
                    error={form.formState.errors.description?.message}
                    className="resize-none"
                  />
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Preço de Custo *</Label>
                    <CurrencyInput
                      id="cost_price"
                      value={form.watch("costPrice")}
                      onChange={(value) =>
                        form.setValue("costPrice", value || 0, {
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.costPrice?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Preço de Venda *</Label>
                    <CurrencyInput
                      id="sale_price"
                      value={form.watch("salePrice")}
                      onChange={(value) =>
                        form.setValue("salePrice", value || 0, {
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.salePrice?.message}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">
                    Quantidade em Estoque *
                  </Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    step="0.001"
                    min="0"
                    {...form.register("stockQuantity", { valueAsNumber: true })}
                    error={form.formState.errors.stockQuantity?.message}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createProduct.isPending || updateProduct.isPending
                    }
                  >
                    {createProduct.isPending || updateProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? "Atualizando..." : "Criando..."}
                      </>
                    ) : (
                      <>{editingProduct ? "Atualizar" : "Criar"} Produto</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {hasActiveFilters ? 1 : 0}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
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
                  placeholder="Nome, descrição ou categoria..."
                  {...filtersForm.register("searchTerm")}
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque Baixo</Label>
                <Select
                  value={
                    filtersForm.watch("lowStockFilter") === null
                      ? "all"
                      : filtersForm.watch("lowStockFilter")
                      ? "yes"
                      : "no"
                  }
                  onValueChange={(value) => {
                    filtersForm.setValue(
                      "lowStockFilter",
                      value === "all" ? null : value === "yes"
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="yes">
                      Apenas com estoque baixo
                    </SelectItem>
                    <SelectItem value="no">Apenas com estoque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <MultiSelectSearchable
                  value={filtersForm.watch("categoryFilter")}
                  onChange={(value) =>
                    filtersForm.setValue("categoryFilter", value)
                  }
                  options={[
                    { value: "sem_categoria", label: "Sem categoria" },
                    ...categories.map((cat) => ({
                      value: cat.name,
                      label: cat.name,
                    })),
                  ]}
                  placeholder="Todas as categorias"
                  searchPlaceholder="Buscar categoria..."
                  emptyMessage="Nenhuma categoria encontrada."
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda Mínimo</Label>
                <CurrencyInput
                  value={filtersForm.watch("minSalePrice") || 0}
                  onChange={(value) =>
                    filtersForm.setValue("minSalePrice", value || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda Máximo</Label>
                <CurrencyInput
                  value={filtersForm.watch("maxSalePrice") || 0}
                  onChange={(value) =>
                    filtersForm.setValue("maxSalePrice", value || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Custo Mínimo</Label>
                <CurrencyInput
                  value={filtersForm.watch("minCostPrice") || 0}
                  onChange={(value) =>
                    filtersForm.setValue("minCostPrice", value || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Custo Máximo</Label>
                <CurrencyInput
                  value={filtersForm.watch("maxCostPrice") || 0}
                  onChange={(value) =>
                    filtersForm.setValue("maxCostPrice", value || null)
                  }
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
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                {paginationMeta
                  ? `${paginationMeta.total} produto(s) encontrado(s) - Página ${paginationMeta.page} de ${paginationMeta.totalPages}`
                  : `${products.length} produto(s) cadastrado(s)`}
                {hasActiveFilters && " (filtros aplicados)"}
              </CardDescription>
            </div>
            {selectedProducts.size > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="destructive"
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDeleteProducts.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir {selectedProducts.size} selecionado(s)
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
          {products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-6">
              {hasActiveFilters
                ? "Nenhum produto encontrado com os filtros aplicados"
                : "Nenhum produto cadastrado ainda"}
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 sm:px-0">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          products.length > 0 &&
                          selectedProducts.size === products.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço Custo</TableHead>
                    <TableHead>Preço Venda</TableHead>
                    <TableHead>Lucro Unitário</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>Ações</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const isLowStock = product.stockQuantity <= 0;
                    // Buscar o nome da categoria pelo ID
                    const categoryName = product.category
                      ? categories.find(
                          (cat) =>
                            cat.id === product.category ||
                            cat.name === product.category
                        )?.name || product.category
                      : null;
                    // Calcular lucro
                    const profit = product.salePrice - product.costPrice;
                    const profitPercentage =
                      product.costPrice > 0
                        ? ((profit / product.costPrice) * 100).toFixed(1)
                        : "0";
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleSelect(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <button
                              onClick={() => navigate(`/produtos/${product.id}`)}
                              className="font-medium hover:text-primary hover:underline text-left"
                            >
                              {product.name}
                            </button>
                            {product.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {categoryName ? (
                            <Badge variant="outline">{categoryName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.costPrice)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.salePrice)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className={
                                profit >= 0
                                  ? "text-success font-medium"
                                  : "text-destructive font-medium"
                              }
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(profit)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({profitPercentage}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                isLowStock ? "text-warning font-medium" : ""
                              }
                            >
                              {Number(product.stockQuantity).toLocaleString(
                                "pt-BR",
                                {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 3,
                                }
                              )}
                            </span>
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              className="flex-1 w-40 max-w-40"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenStockDialog(product.id)}
                              title="Ajustar estoque do produto"
                            >
                              Ajustar estoque
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(product.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product.id)}
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
                {paginationMeta.total} produtos
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
              Tem certeza que deseja excluir este produto? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
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
              Tem certeza que deseja excluir {selectedProducts.size} produto(s)?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteProducts.isPending}
            >
              {bulkDeleteProducts.isPending ? (
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

      {/* Dialog de Ajuste de Estoque */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              Ajuste a quantidade em estoque do produto
            </DialogDescription>
          </DialogHeader>
          {productForStock &&
            (() => {
              const product = allProducts.find((p) => p.id === productForStock);
              if (!product) return null;

              const currentStock = stockForm.watch("stockQuantity") || 0;

              return (
                <form
                  onSubmit={stockForm.handleSubmit(
                    handleConfirmStockAdjustment
                  )}
                  className="space-y-3 sm:space-y-4"
                >
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Produto: {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estoque atual:{" "}
                      <strong>
                        {product.stockQuantity.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 3,
                        })}
                      </strong>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock-quantity">
                      Quantidade em Estoque
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = currentStock || 0;
                          const newValue = Math.max(
                            0,
                            Number(currentValue) - 1
                          );
                          stockForm.setValue("stockQuantity", newValue, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={currentStock <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="stock-quantity"
                        type="number"
                        step="0.001"
                        min="0"
                        {...stockForm.register("stockQuantity", {
                          valueAsNumber: true,
                        })}
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentValue = currentStock || 0;
                          const newValue = Number(currentValue) + 1;
                          stockForm.setValue("stockQuantity", newValue, {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {stockForm.formState.errors.stockQuantity && (
                      <p className="text-sm text-destructive">
                        {stockForm.formState.errors.stockQuantity.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Estoque atual:{" "}
                      <strong>
                        {product.stockQuantity.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 3,
                        })}
                      </strong>{" "}
                      → Novo estoque:{" "}
                      <strong>
                        {currentStock.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 3,
                        })}
                      </strong>
                    </p>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseStockDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProduct.isPending || currentStock < 0}
                    >
                      {updateProduct.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ajustando...
                        </>
                      ) : (
                        "Confirmar Ajuste"
                      )}
                    </Button>
                  </div>
                </form>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
