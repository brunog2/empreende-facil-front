import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional().nullable(),
  costPrice: z.coerce
    .number()
    .min(0, "O preço de custo deve ser maior ou igual a zero"),
  salePrice: z.coerce
    .number()
    .min(0, "O preço de venda deve ser maior ou igual a zero"),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export function useProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForStock, setProductForStock] = useState<string | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);

  // Filtros
  const [lowStockFilter, setLowStockFilter] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [minSalePrice, setMinSalePrice] = useState<number | null>(null);
  const [maxSalePrice, setMaxSalePrice] = useState<number | null>(null);
  const [minCostPrice, setMinCostPrice] = useState<number | null>(null);
  const [maxCostPrice, setMaxCostPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Aplicar filtro de estoque baixo se vier da dashboard
  useEffect(() => {
    if (searchParams.get("estoqueBaixo") === "true") {
      setLowStockFilter(true);
      setShowFilters(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId)
    : null;

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

  const handleOpenDialog = (productId?: string) => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setEditingProductId(productId);
        form.reset({
          name: product.name,
          description: product.description || "",
          category: product.category,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          stockQuantity: product.stockQuantity,
        });
      }
    } else {
      setEditingProductId(null);
      form.reset({
        name: "",
        description: "",
        category: null,
        costPrice: 0,
        salePrice: 0,
        stockQuantity: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProductId(null);
    form.reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProductId) {
        await updateProduct.mutateAsync({
          id: editingProductId,
          data: {
            name: data.name,
            description: data.description || null,
            category: data.category || null,
            costPrice: data.costPrice,
            salePrice: data.salePrice,
            stockQuantity: data.stockQuantity,
          },
        });
      } else {
        await createProduct.mutateAsync({
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          costPrice: data.costPrice,
          salePrice: data.salePrice,
          stockQuantity: data.stockQuantity,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct.mutateAsync(productToDelete);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const handleOpenStockDialog = (productId: string) => {
    setProductForStock(productId);
    setStockAdjustment(0);
    setStockDialogOpen(true);
  };

  const handleCloseStockDialog = () => {
    setStockDialogOpen(false);
    setProductForStock(null);
    setStockAdjustment(0);
  };

  const handleConfirmStockAdjustment = async () => {
    if (productForStock) {
      const product = products.find((p) => p.id === productForStock);
      if (product) {
        try {
          await updateProduct.mutateAsync({
            id: productForStock,
            data: {
              stockQuantity: product.stockQuantity + stockAdjustment,
            },
          });
          handleCloseStockDialog();
        } catch (error) {
          // Erro já é tratado pelo hook
        }
      }
    }
  };

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    if (
      lowStockFilter !== null &&
      product.stockQuantity <= 0 !== lowStockFilter
    ) {
      return false;
    }
    if (categoryFilter && categoryFilter !== "all") {
      if (categoryFilter === "sem_categoria") {
        if (product.category) return false;
      } else {
        if (product.category !== categoryFilter) return false;
      }
    }
    if (minSalePrice !== null && product.salePrice < minSalePrice) {
      return false;
    }
    if (maxSalePrice !== null && product.salePrice > maxSalePrice) {
      return false;
    }
    if (minCostPrice !== null && product.costPrice < minCostPrice) {
      return false;
    }
    if (maxCostPrice !== null && product.costPrice > maxCostPrice) {
      return false;
    }
    return true;
  });

  const hasActiveFilters =
    lowStockFilter !== null ||
    (categoryFilter && categoryFilter !== "all") ||
    minSalePrice !== null ||
    maxSalePrice !== null ||
    minCostPrice !== null ||
    maxCostPrice !== null;

  const clearFilters = () => {
    setLowStockFilter(null);
    setCategoryFilter(null);
    setMinSalePrice(null);
    setMaxSalePrice(null);
    setMinCostPrice(null);
    setMaxCostPrice(null);
  };

  return {
    // Data
    products: filteredProducts,
    allProducts: products,
    categories,
    editingProduct,
    isLoading,
    
    // Form
    form,
    onSubmit,
    
    // Dialogs
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    stockDialogOpen,
    setStockDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    
    // Stock Dialog
    productForStock,
    stockAdjustment,
    setStockAdjustment,
    handleOpenStockDialog,
    handleCloseStockDialog,
    handleConfirmStockAdjustment,
    
    // Delete
    handleDeleteClick,
    handleConfirmDelete,
    deleteProduct,
    
    // Filters
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
    
    // Mutations
    createProduct,
    updateProduct,
  };
}

