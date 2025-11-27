import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useBulkDeleteExpenses,
  useExpensesByCategory,
} from "@/hooks/use-expenses";

const expenseSchema = z
  .object({
    description: z.string().min(1, "A descrição é obrigatória"),
    amount: z.number().min(0.01, "O valor deve ser maior que zero"),
    category: z.string().min(1, "A categoria é obrigatória"),
    expenseDate: z.string().min(1, "A data é obrigatória"),
    isRecurring: z.boolean().default(false),
    recurrencePeriod: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isRecurring && !data.recurrencePeriod) {
        return false;
      }
      return true;
    },
    {
      message: "Despesas recorrentes devem ter um período de recorrência",
      path: ["recurrencePeriod"],
    }
  );

export type ExpenseFormData = z.infer<typeof expenseSchema>;

const recurrenceOptions = [
  { value: "diaria", label: "Diária" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

export function useExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [recurringFilter, setRecurringFilter] = useState<boolean | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  const { data: allExpenses = [], isLoading } = useExpenses();
  const { data: filteredExpensesByCategory = [] } = useExpensesByCategory(
    categoryFilter
  );
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const bulkDeleteExpenses = useBulkDeleteExpenses();

  const editingExpense = editingExpenseId
    ? allExpenses.find((e) => e.id === editingExpenseId)
    : null;

  // Filtrar despesas
  let expenses = allExpenses;
  if (categoryFilter) {
    expenses = filteredExpensesByCategory;
  }

  if (recurringFilter !== null) {
    expenses = expenses.filter((e) => e.isRecurring === recurringFilter);
  }

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      expenseDate: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurrencePeriod: null,
    },
  });

  const isRecurring = form.watch("isRecurring");

  const handleOpenDialog = (expenseId?: string) => {
    if (expenseId) {
      const expense = allExpenses.find((e) => e.id === expenseId);
      if (expense) {
        setEditingExpenseId(expenseId);
        form.reset({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          expenseDate: new Date(expense.expenseDate)
            .toISOString()
            .split("T")[0],
          isRecurring: expense.isRecurring || false,
          recurrencePeriod: expense.recurrencePeriod || null,
        });
      }
    } else {
      setEditingExpenseId(null);
      form.reset({
        description: "",
        amount: 0,
        category: "",
        expenseDate: new Date().toISOString().split("T")[0],
        isRecurring: false,
        recurrencePeriod: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpenseId(null);
    form.reset();
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (editingExpenseId) {
        await updateExpense.mutateAsync({
          id: editingExpenseId,
          data: {
            description: data.description,
            amount: data.amount,
            category: data.category,
            expenseDate: new Date(data.expenseDate).toISOString(),
            isRecurring: data.isRecurring,
            recurrencePeriod: data.isRecurring ? data.recurrencePeriod : null,
          },
        });
      } else {
        await createExpense.mutateAsync({
          description: data.description,
          amount: data.amount,
          category: data.category,
          expenseDate: new Date(data.expenseDate).toISOString(),
          isRecurring: data.isRecurring,
          recurrencePeriod: data.isRecurring ? data.recurrencePeriod : null,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense.mutateAsync(expenseToDelete);
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  // Selection logic
  const toggleSelect = (expenseId: string) => {
    setSelectedExpenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedExpenses.size === expenses.length && expenses.length > 0) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(expenses.map((e) => e.id)));
    }
  };

  const clearSelection = () => {
    setSelectedExpenses(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (selectedExpenses.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedExpenses.size > 0) {
      try {
        await bulkDeleteExpenses.mutateAsync(Array.from(selectedExpenses));
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return {
    // Data
    expenses,
    allExpenses,
    editingExpense,
    isLoading,
    recurrenceOptions,
    
    // Form
    form,
    isRecurring,
    onSubmit,
    
    // Dialogs
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    
    // Delete
    handleDeleteClick,
    handleConfirmDelete,
    deleteExpense,

    // Bulk Delete
    selectedExpenses,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteExpenses,
    
    // Filters
    categoryFilter,
    setCategoryFilter,
    recurringFilter,
    setRecurringFilter,
    
    // Calculations
    totalExpenses,
    
    // Mutations
    createExpense,
    updateExpense,
  };
}

