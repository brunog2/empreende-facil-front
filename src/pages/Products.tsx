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

export default function Products() {
  const {
    products,
    allProducts,
    categories,
    editingProduct,
    isLoading,
    form,
    onSubmit,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
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
    lowStockFilter,
    setLowStockFilter,
    categoryFilter,
    setCategoryFilter,
    minSalePrice,
    setMinSalePrice,
    maxSalePrice,
    setMaxSalePrice,
    minCostPrice,
    setMinCostPrice,
    maxCostPrice,
    setMaxCostPrice,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,
    createProduct,
    updateProduct,
  } = useProductsPage();

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
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
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                {
                  [
                    lowStockFilter !== null,
                    categoryFilter,
                    minSalePrice !== null,
                    maxSalePrice !== null,
                    minCostPrice !== null,
                    maxCostPrice !== null,
                  ].filter(Boolean).length
                }
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
                <Label>Estoque Baixo</Label>
                <Select
                  value={
                    lowStockFilter === null
                      ? "all"
                      : lowStockFilter
                      ? "yes"
                      : "no"
                  }
                  onValueChange={(value) => {
                    setLowStockFilter(value === "all" ? null : value === "yes");
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
                  value={categoryFilter}
                  onChange={(value) => setCategoryFilter(value)}
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
                  value={minSalePrice || 0}
                  onChange={(value) => setMinSalePrice(value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Venda Máximo</Label>
                <CurrencyInput
                  value={maxSalePrice || 0}
                  onChange={(value) => setMaxSalePrice(value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Custo Mínimo</Label>
                <CurrencyInput
                  value={minCostPrice || 0}
                  onChange={(value) => setMinCostPrice(value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço de Custo Máximo</Label>
                <CurrencyInput
                  value={maxCostPrice || 0}
                  onChange={(value) => setMaxCostPrice(value || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {products.length} de {allProducts.length} produto(s) cadastrado(s)
            {hasActiveFilters && " (filtros aplicados)"}
          </CardDescription>
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
                          <div>
                            <div className="font-medium">{product.name}</div>
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
                  className="space-y-4"
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
                          console.log(newValue);
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
                  <div className="flex justify-end gap-3">
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
