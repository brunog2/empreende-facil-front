import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSales,
  useSalesWithFilters,
  useSale,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
  useBulkDeleteSales,
} from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import type { Sale, SaleFilters } from "@/types/sales";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce
    .number()
    .positive("A quantidade deve ser maior que zero")
    .min(0.01, "A quantidade deve ser pelo menos 0.01"),
  unitPrice: z.coerce
    .number()
    .min(0, "O preço unitário deve ser maior ou igual a zero"),
});

const saleSchema = z
  .object({
    customerId: z.string().optional().nullable(),
    paymentMethod: z.string().min(1, "Selecione uma forma de pagamento"),
    notes: z.string().optional().nullable(),
    saleDate: z.string().min(1, "A data é obrigatória"),
    saleTime: z.string().min(1, "A hora é obrigatória"),
    items: z.array(saleItemSchema).min(1, "Adicione pelo menos um produto"),
  })
  .refine((data) => data.items.length > 0, {
    message: "Adicione pelo menos um produto à venda",
    path: ["items"],
  });

export type SaleFormData = z.infer<typeof saleSchema>;

export function useSalesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros com React Hook Form
  const filtersForm = useForm<{
    searchTerm: string;
    categoryFilter: string[];
    productFilter: string[];
    startDate: string;
    endDate: string;
  }>({
    defaultValues: {
      searchTerm: "",
      categoryFilter: [],
      productFilter: [],
      startDate: "",
      endDate: "",
    },
  });

  const searchTerm = filtersForm.watch("searchTerm");
  const categoryFilter = filtersForm.watch("categoryFilter");
  const productFilter = filtersForm.watch("productFilter");
  const startDate = filtersForm.watch("startDate");
  const endDate = filtersForm.watch("endDate");

  // Determinar se há filtros ativos
  const hasActiveFilters =
    searchTerm ||
    categoryFilter.length > 0 ||
    productFilter.length > 0 ||
    startDate ||
    endDate;

  // Sempre usar paginação do backend
  const backendFilters: SaleFilters = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(categoryFilter.length > 0 && { categories: categoryFilter }),
    ...(productFilter.length > 0 && { products: productFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  // Sempre usar hook com filtros (que inclui paginação)
  const { data: paginatedData, isLoading: salesLoading } =
    useSalesWithFilters(backendFilters);
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const sales = paginatedData?.data || [];
  const paginationMeta = paginatedData?.meta || null;
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();
  const bulkDeleteSales = useBulkDeleteSales();

  // Buscar venda individual quando estiver editando (pode não estar na página atual)
  const { data: editingSaleData } = useSale(editingSaleId);
  const editingSale = editingSaleId
    ? editingSaleData || sales.find((s) => s.id === editingSaleId)
    : null;

  // Helper para obter hora atual no formato HH:mm
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: null,
      paymentMethod: "dinheiro",
      notes: "",
      saleDate: new Date().toISOString().split("T")[0],
      saleTime: getCurrentTime(),
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Abrir modal automaticamente se vier da dashboard
  useEffect(() => {
    if (searchParams.get("novaVenda") === "true") {
      handleOpenDialog();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, productFilter, startDate, endDate]);

  // Preencher formulário quando editingSale estiver disponível
  useEffect(() => {
    if (editingSale && editingSaleId && dialogOpen) {
      // Extrair data e hora da venda existente
      let saleDateStr = new Date().toISOString().split("T")[0];
      let saleTimeStr = getCurrentTime();

      if (editingSale.saleDate) {
        // Extrair apenas a data (YYYY-MM-DD) da string ISO, ignorando timezone
        const dateStr = editingSale.saleDate.split("T")[0];
        saleDateStr = dateStr;

        // Extrair hora da string ISO
        const timeMatch = editingSale.saleDate.match(/T(\d{2}):(\d{2})/);
        if (timeMatch) {
          saleTimeStr = `${timeMatch[1]}:${timeMatch[2]}`;
        }
      }

      form.reset({
        customerId: editingSale.customerId || null,
        paymentMethod: editingSale.paymentMethod || "dinheiro",
        notes: editingSale.notes || "",
        saleDate: saleDateStr,
        saleTime: saleTimeStr,
        items: editingSale.saleItems.map((item) => ({
          productId: item.productId || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    }
  }, [editingSale, editingSaleId, dialogOpen, form]);

  const clearFilters = () => {
    filtersForm.reset({
      searchTerm: "",
      categoryFilter: [],
      productFilter: [],
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const handleOpenDialog = (saleId?: string) => {
    if (saleId) {
      setEditingSaleId(saleId);
      // O editingSale será atualizado via useSale hook e useEffect abaixo
    } else {
      setEditingSaleId(null);
      form.reset({
        customerId: null,
        paymentMethod: "dinheiro",
        notes: "",
        saleDate: new Date().toISOString().split("T")[0],
        saleTime: getCurrentTime(),
        items: [],
      });
      // Adicionar um item vazio ao abrir o modal para nova venda
      append({
        productId: "",
        quantity: 1,
        unitPrice: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSaleId(null);
    form.reset();
  };

  const addSaleItem = () => {
    append({ productId: "", quantity: 1, unitPrice: 0 });
  };

  const updateSaleItem = (
    index: number,
    field: keyof SaleFormData["items"][0],
    value: string | number
  ) => {
    const currentItem = form.watch(`items.${index}`);
    const fieldPath = `items.${index}.${field}` as Path<SaleFormData>;
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        update(index, {
          ...currentItem,
          productId: value as string,
          unitPrice: product.salePrice,
        });
        form.clearErrors(`items.${index}.productId` as Path<SaleFormData>);
        form.clearErrors(`items.${index}.unitPrice` as Path<SaleFormData>);
      }
    } else {
      update(index, {
        ...currentItem,
        [field]: value,
      });
    }
    form.clearErrors(fieldPath);
  };

  const calculateTotal = () => {
    const items = form.watch("items");
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const onSubmit = async (data: SaleFormData) => {
    try {
      const totalAmount = calculateTotal();
      const saleItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // Combinar data e hora em um objeto Date
      // Criar a data como UTC para evitar problemas de timezone
      const [year, month, day] = data.saleDate.split("-").map(Number);
      const [hours, minutes] = data.saleTime.split(":").map(Number);
      // Criar data UTC diretamente (month é 0-indexed no Date, então month - 1)
      const saleDateTime = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0, 0)
      );

      if (editingSaleId) {
        await updateSale.mutateAsync({
          id: editingSaleId,
          data: {
            customerId: data.customerId || null,
            paymentMethod: data.paymentMethod,
            notes: data.notes || null,
            saleDate: saleDateTime,
            items: saleItems,
            totalAmount,
          },
        });
      } else {
        await createSale.mutateAsync({
          customerId: data.customerId || null,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          saleDate: saleDateTime,
          items: saleItems,
          totalAmount,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setSaleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (saleToDelete) {
      try {
        await deleteSale.mutateAsync(saleToDelete);
        setDeleteDialogOpen(false);
        setSaleToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  // Selection logic
  const toggleSelect = (saleId: string) => {
    setSelectedSales((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSales.size === sales.length && sales.length > 0) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(sales.map((s) => s.id)));
    }
  };

  const clearSelection = () => {
    setSelectedSales(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (selectedSales.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedSales.size > 0) {
      try {
        await bulkDeleteSales.mutateAsync(Array.from(selectedSales));
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  return {
    // Data
    sales,
    products,
    editingSale,
    isLoading: salesLoading || productsLoading,
    paginationMeta,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,

    // Form
    form,
    fields,
    addSaleItem,
    updateSaleItem,
    removeSaleItem: remove,
    calculateTotal,
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
    deleteSale,

    // Bulk Delete
    selectedSales,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteSales,

    // Filters
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,

    // Mutations
    createSale,
    updateSale,
  };
}
