import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";

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
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const editingCategory = editingCategoryId
    ? categories.find((c) => c.id === editingCategoryId)
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
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        setEditingCategoryId(categoryId);
        form.reset({
          name: category.name,
          description: category.description || "",
        });
      }
    } else {
      setEditingCategoryId(null);
      form.reset({
        name: "",
        description: "",
      });
    }
    setDialogOpen(true);
  };

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

  return {
    // Data
    categories,
    editingCategory,
    isLoading,
    
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
    
    // Mutations
    createCategory,
    updateCategory,
  };
}

