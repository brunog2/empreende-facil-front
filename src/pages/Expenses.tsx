import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Filter, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ExpensesShimmer } from "@/components/shimmer/ExpensesShimmer";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ExpenseCategorySelect } from "@/components/ExpenseCategorySelect";
import { useExpensesPage } from "@/hooks/use-expenses-page";

const categories = [
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Telefone",
  "Salários",
  "Impostos",
  "Matéria-prima",
  "Manutenção",
  "Marketing",
  "Outros",
];

export default function Expenses() {
  const {
    expenses,
    editingExpense,
    isLoading,
    recurrenceOptions,
    form,
    isRecurring,
    onSubmit,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleDeleteClick,
    handleConfirmDelete,
    deleteExpense,
    categoryFilter,
    setCategoryFilter,
    recurringFilter,
    setRecurringFilter,
    totalExpenses,
    createExpense,
    updateExpense,
  } = useExpensesPage();

  if (isLoading) {
    return <ExpensesShimmer />;
  }

  return (
    <div className="space-y-6 p-6 w-full" style={{ maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Controle seus gastos e despesas fixas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              <DialogDescription>
                {editingExpense ? "Atualize os dados da despesa" : "Registre uma despesa ou custo do negócio"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  {...form.register("description")}
                  placeholder="Ex: Conta de luz, Aluguel, etc."
                  error={form.formState.errors.description?.message}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <CurrencyInput
                    id="amount"
                    value={form.watch("amount")}
                    onChange={(value) => form.setValue("amount", value || 0, { shouldValidate: true })}
                    error={form.formState.errors.amount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <ExpenseCategorySelect
                    value={form.watch("category")}
                    onChange={(value) => form.setValue("category", value, { shouldValidate: true })}
                    error={form.formState.errors.category?.message}
                    categories={categories}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_date">Data *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  {...form.register("expenseDate")}
                  error={form.formState.errors.expenseDate?.message}
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    form.setValue("isRecurring", checked);
                    if (!checked) {
                      form.setValue("recurrencePeriod", null);
                    }
                  }}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Despesa recorrente
                </Label>
              </div>
              {isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence">Período de Recorrência *</Label>
                  <Select
                    value={form.watch("recurrencePeriod") || ""}
                    onValueChange={(value) => form.setValue("recurrencePeriod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.recurrencePeriod && (
                    <p className="text-sm text-destructive">{form.formState.errors.recurrencePeriod.message}</p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createExpense.isPending || updateExpense.isPending}
                >
                  {(createExpense.isPending || updateExpense.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingExpense ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingExpense ? "Atualizar" : "Criar"} Despesa
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Destaque para Despesas */}
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-red-600">Total de Despesas</h2>
              <p className="text-muted-foreground mb-4">
                {categoryFilter ? `Categoria: "${categoryFilter}"` : "Todas as categorias"} 
                {recurringFilter !== null && (recurringFilter ? " - Recorrentes" : " - Avulsas")}
              </p>
              <div className="text-4xl font-bold text-red-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
              </div>
            </div>
            <TrendingDown className="h-24 w-24 text-red-200" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select
                value={recurringFilter === null ? "all" : recurringFilter ? "recurring" : "one-time"}
                onValueChange={(value) => {
                  if (value === "all") setRecurringFilter(null);
                  else if (value === "recurring") setRecurringFilter(true);
                  else setRecurringFilter(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="recurring">Recorrentes</SelectItem>
                  <SelectItem value="one-time">Avulsas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(categoryFilter || recurringFilter !== null) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategoryFilter(null);
                  setRecurringFilter(null);
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>
            {expenses.length} despesa(s) {categoryFilter ? `na categoria "${categoryFilter}"` : ""} {recurringFilter !== null ? (recurringFilter ? "recorrentes" : "avulsas") : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {expenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-6">
              Nenhuma despesa registrada ainda
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 sm:px-0">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expense.description}
                        {expense.isRecurring && (
                          <Badge variant="secondary" className="text-xs">
                            {recurrenceOptions.find((opt) => opt.value === expense.recurrencePeriod)?.label || expense.recurrencePeriod}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(expense.expenseDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium text-destructive">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(expense.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending ? (
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
