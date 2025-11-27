import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProducts,
  useProductsWithFilters,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { Product, ProductFilters } from "@/types/products";

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
    .min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

export type ProductFormData = z.infer<typeof productSchema>;

const stockAdjustmentSchema = z.object({
  stockQuantity: z.coerce
    .number()
    .min(0, "A quantidade em estoque deve ser maior ou igual a zero"),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

const productFiltersSchema = z.object({
  searchTerm: z.string().default(""),
  lowStockFilter: z.boolean().nullable().default(null),
  categoryFilter: z.array(z.string()).default([]),
  minSalePrice: z.coerce.number().nullable().default(null),
  maxSalePrice: z.coerce.number().nullable().default(null),
  minCostPrice: z.coerce.number().nullable().default(null),
  maxCostPrice: z.coerce.number().nullable().default(null),
});

export type ProductFiltersFormData = z.infer<typeof productFiltersSchema>;

export function useProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForStock, setProductForStock] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  // Filtros com React Hook Form
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const filtersForm = useForm<ProductFiltersFormData>({
    resolver: zodResolver(productFiltersSchema),
    defaultValues: {
      searchTerm: "",
      lowStockFilter: null,
      categoryFilter: [],
      minSalePrice: null,
      maxSalePrice: null,
      minCostPrice: null,
      maxCostPrice: null,
    },
  });

  // Watch dos valores do form de filtros
  const searchTerm = filtersForm.watch("searchTerm");
  const lowStockFilter = filtersForm.watch("lowStockFilter");
  const categoryFilter = filtersForm.watch("categoryFilter");
  const minSalePrice = filtersForm.watch("minSalePrice");
  const maxSalePrice = filtersForm.watch("maxSalePrice");
  const minCostPrice = filtersForm.watch("minCostPrice");
  const maxCostPrice = filtersForm.watch("maxCostPrice");

  // Determinar se há filtros ativos (além de paginação)
  const hasActiveFilters =
    searchTerm ||
    lowStockFilter !== null ||
    categoryFilter.length > 0 ||
    minSalePrice !== null ||
    maxSalePrice !== null ||
    minCostPrice !== null ||
    maxCostPrice !== null;

  // Sempre usar paginação do backend
  const backendFilters: ProductFilters = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(categoryFilter.length > 0 && { categories: categoryFilter }),
    ...(lowStockFilter !== null && { lowStock: lowStockFilter }),
    ...(minSalePrice !== null && { minSalePrice }),
    ...(maxSalePrice !== null && { maxSalePrice }),
    ...(minCostPrice !== null && { minCostPrice }),
    ...(maxCostPrice !== null && { maxCostPrice }),
  };

  // Sempre usar hook com filtros (que inclui paginação)
  const { data: paginatedData, isLoading } =
    useProductsWithFilters(backendFilters);

  const products = paginatedData?.data || [];
  const paginationMeta = paginatedData?.meta || null;
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDeleteProducts = useBulkDeleteProducts();

  // Aplicar filtro de estoque baixo se vier da dashboard
  useEffect(() => {
    if (searchParams.get("estoqueBaixo") === "true") {
      filtersForm.setValue("lowStockFilter", true);
      setShowFilters(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, filtersForm]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    lowStockFilter,
    categoryFilter,
    minSalePrice,
    maxSalePrice,
    minCostPrice,
    maxCostPrice,
  ]);

  // Buscar produto individual quando estiver editando (pode não estar na página atual)
  const { data: individualEditingProduct } = useProduct(editingProductId);
  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId) ||
      individualEditingProduct
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

  const stockForm = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      stockQuantity: 0,
    },
  });

  const handleOpenDialog = (productId?: string) => {
    if (productId) {
      setEditingProductId(productId);
      // O editingProduct será atualizado via useProduct hook e useEffect abaixo
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

  // Preencher formulário quando editingProduct estiver disponível
  useEffect(() => {
    if (editingProduct && editingProductId && dialogOpen) {
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description || "",
        category: editingProduct.category,
        costPrice: editingProduct.costPrice,
        salePrice: editingProduct.salePrice,
        stockQuantity: editingProduct.stockQuantity,
      });
    }
  }, [editingProduct, editingProductId, dialogOpen, form]);

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
    const product = products.find((p) => p.id === productId);
    setProductForStock(productId);
    setStockDialogOpen(true);

    // Configurar o form com o estoque atual do produto
    if (product) {
      const initialQuantity = product.stockQuantity;
      stockForm.reset({
        stockQuantity: initialQuantity,
      });
    }
  };

  const handleCloseStockDialog = () => {
    setStockDialogOpen(false);
    setProductForStock(null);
    stockForm.reset({
      stockQuantity: 0,
    });
  };

  const handleConfirmStockAdjustment = async (
    data: StockAdjustmentFormData
  ) => {
    if (productForStock && data.stockQuantity >= 0) {
      try {
        await updateProduct.mutateAsync({
          id: productForStock,
          data: {
            stockQuantity: data.stockQuantity,
          },
        });
        handleCloseStockDialog();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const clearFilters = () => {
    filtersForm.reset({
      searchTerm: "",
      lowStockFilter: null,
      categoryFilter: [],
      minSalePrice: null,
      maxSalePrice: null,
      minCostPrice: null,
      maxCostPrice: null,
    });
    setCurrentPage(1);
  };

  // Selection logic
  const toggleSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length && products.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (selectedProducts.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProducts.size > 0) {
      try {
        await bulkDeleteProducts.mutateAsync(Array.from(selectedProducts));
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  return {
    // Data
    products,
    allProducts: products, // Para compatibilidade, mas agora sempre paginado
    categories,
    editingProduct,
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
    stockDialogOpen,
    setStockDialogOpen,
    handleOpenDialog,
    handleCloseDialog,

    // Stock Dialog
    productForStock,
    stockForm,
    handleOpenStockDialog,
    handleCloseStockDialog,
    handleConfirmStockAdjustment,

    // Delete
    handleDeleteClick,
    handleConfirmDelete,
    deleteProduct,

    // Bulk Delete
    selectedProducts,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteProducts,

    // Filters
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,

    // Mutations
    createProduct,
    updateProduct,
  };
}
