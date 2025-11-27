import React from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { CategorySelect } from "@/components/CategorySelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ProductsShimmer } from "@/components/shimmer/ProductsShimmer";

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  category: z.string().nullable(),
  costPrice: z.number().min(0, "O preço de custo deve ser maior ou igual a zero"),
  salePrice: z.number().min(0, "O preço de venda deve ser maior ou igual a zero"),
  stockQuantity: z.number().min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading: isLoadingProduct } = useProduct(id || null);
  const { data: categories = [] } = useCategories();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: null,
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
    },
  });

  const [isEditing, setIsEditing] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category: product.category,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
      });
    }
  }, [product, form]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;

    try {
      await updateProduct.mutateAsync({
        id,
        data,
      });
      setIsEditing(false);
      toast.success("Produto atualizado com sucesso!");
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto excluído com sucesso!");
      navigate("/produtos");
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const categoryName = product?.category
    ? categories.find((cat) => cat.id === product.category)?.name || product.category
    : null;

  const profit = product ? product.salePrice - product.costPrice : 0;
  const profitPercentage = product && product.costPrice > 0
    ? ((profit / product.costPrice) * 100).toFixed(2)
    : "0";

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <ProductsShimmer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Produto não encontrado</p>
            <Button
              variant="outline"
              onClick={() => navigate("/produtos")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/produtos")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Produtos
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {product.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Detalhes do produto
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({
                      name: product.name,
                      description: product.description || "",
                      category: product.category,
                      costPrice: product.costPrice,
                      salePrice: product.salePrice,
                      stockQuantity: product.stockQuantity,
                    });
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={updateProduct.isPending}
                >
                  {updateProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
          <CardDescription>
            {isEditing
              ? "Edite as informações do produto abaixo"
              : "Visualize as informações do produto"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    {...form.register("name")}
                    error={form.formState.errors.name?.message}
                  />
                ) : (
                  <p className="text-sm font-medium">{product.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                {isEditing ? (
                  <CategorySelect
                    value={form.watch("category")}
                    onChange={(value) =>
                      form.setValue("category", value || null)
                    }
                    error={form.formState.errors.category?.message}
                  />
                ) : (
                  <div>
                    {categoryName ? (
                      <Badge variant="outline">{categoryName}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sem categoria
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={3}
                  placeholder="Descreva o produto..."
                  error={form.formState.errors.description?.message}
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {product.description || "Sem descrição"}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo *</Label>
                {isEditing ? (
                  <CurrencyInput
                    id="costPrice"
                    value={form.watch("costPrice")}
                    onChange={(value) =>
                      form.setValue("costPrice", value || 0, {
                        shouldValidate: true,
                      })
                    }
                    error={form.formState.errors.costPrice?.message}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.costPrice)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda *</Label>
                {isEditing ? (
                  <CurrencyInput
                    id="salePrice"
                    value={form.watch("salePrice")}
                    onChange={(value) =>
                      form.setValue("salePrice", value || 0, {
                        shouldValidate: true,
                      })
                    }
                    error={form.formState.errors.salePrice?.message}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.salePrice)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Estoque *</Label>
                {isEditing ? (
                  <Input
                    id="stockQuantity"
                    type="number"
                    step="0.001"
                    min="0"
                    {...form.register("stockQuantity", { valueAsNumber: true })}
                    error={form.formState.errors.stockQuantity?.message}
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {product.stockQuantity.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 3,
                    })}
                  </p>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Lucro Unitário</Label>
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
                </div>

                <div className="space-y-2">
                  <Label>Status do Estoque</Label>
                  <div>
                    {product.stockQuantity <= 0 ? (
                      <Badge variant="destructive">Sem Estoque</Badge>
                    ) : product.stockQuantity < 10 ? (
                      <Badge variant="outline" className="text-warning">
                        Estoque Baixo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-success">
                        Em Estoque
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{product.name}"? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
    </div>
  );
}

