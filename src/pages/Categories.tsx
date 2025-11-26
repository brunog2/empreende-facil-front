import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { CategoriesShimmer } from "@/components/shimmer/CategoriesShimmer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome da categoria é obrigatório")
    .max(100, "O nome não pode ter mais de 100 caracteres"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function Categories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

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

  if (isLoading) {
    return <CategoriesShimmer />;
  }

  return (
    <div
      className="space-y-6 p-6 w-full"
      style={{ maxWidth: "100vw", boxSizing: "border-box" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias dos seus produtos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Atualize os dados da categoria"
                  : "Crie uma nova categoria para seus produtos"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  error={form.formState.errors.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={3}
                  placeholder="Descreva a categoria..."
                  error={form.formState.errors.description?.message}
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
                    createCategory.isPending || updateCategory.isPending
                  }
                >
                  {createCategory.isPending || updateCategory.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCategory ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>{editingCategory ? "Atualizar" : "Criar"} Categoria</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            {categories.length} categoria(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-6">
              Nenhuma categoria cadastrada ainda
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 sm:px-0">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {category.description ? (
                          <span className="text-sm text-muted-foreground">
                            {category.description}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(category.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(category.id)}
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
              Tem certeza que deseja excluir esta categoria? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? (
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
