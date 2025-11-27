import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCategories,
  useCategoriesWithFilters,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useBulkDeleteCategories,
} from "@/hooks/use-categories";
import type { CategoryFilters } from "@/types/categories";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome da categoria é obrigatório")
    .max(100, "O nome não pode ter mais de 100 caracteres"),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export function useCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros com React Hook Form
  const filtersForm = useForm<{
    searchTerm: string;
  }>({
    defaultValues: {
      searchTerm: "",
    },
  });

  const searchTerm = filtersForm.watch("searchTerm");

  // Sempre usar paginação do backend
  const backendFilters: CategoryFilters = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
  };

  // Sempre usar hook com filtros (que inclui paginação)
  const { data: paginatedData, isLoading } =
    useCategoriesWithFilters(backendFilters);

  const categories = paginatedData?.data || [];
  const paginationMeta = paginatedData?.meta || null;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const bulkDeleteCategories = useBulkDeleteCategories();

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const clearFilters = () => {
    filtersForm.reset({
      searchTerm: "",
    });
    setCurrentPage(1);
  };

  // Buscar categoria individual quando estiver editando (pode não estar na página atual)
  const { data: individualEditingCategory } = useCategory(editingCategoryId);
  const editingCategory = editingCategoryId
    ? categories.find((c) => c.id === editingCategoryId) ||
      individualEditingCategory
    : null;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleOpenDialog = (categoryId?: string) => {
    if (categoryId) {
      setEditingCategoryId(categoryId);
      // O editingCategory será atualizado via useCategory hook e useEffect abaixo
    } else {
      setEditingCategoryId(null);
      form.reset({
        name: "",
        description: "",
      });
    }
    setDialogOpen(true);
  };

  // Preencher formulário quando editingCategory estiver disponível
  useEffect(() => {
    if (editingCategory && editingCategoryId && dialogOpen) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
    }
  }, [editingCategory, editingCategoryId, dialogOpen, form]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategoryId(null);
    form.reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategoryId) {
        await updateCategory.mutateAsync({
          id: editingCategoryId,
          data: {
            name: data.name,
            description: data.description || null,
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: data.name,
          description: data.description || null,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  // Selection logic
  const toggleSelect = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (
      selectedCategories.size === categories.length &&
      categories.length > 0
    ) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
    }
  };

  const clearSelection = () => {
    setSelectedCategories(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (selectedCategories.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedCategories.size > 0) {
      try {
        await bulkDeleteCategories.mutateAsync(Array.from(selectedCategories));
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  return {
    // Data
    categories,
    editingCategory,
    isLoading,
    paginationMeta,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,

    // Form
    form,
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
    deleteCategory,

    // Bulk Delete
    selectedCategories,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteCategories,

    // Filters
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters: !!searchTerm,
    clearFilters,

    // Mutations
    createCategory,
    updateCategory,
  };
}
