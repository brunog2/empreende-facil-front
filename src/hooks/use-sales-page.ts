import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useSalesWithFilters,
  useDeleteSale,
  useBulkDeleteSales,
} from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import type { SaleFilters } from "@/types/sales";

export function useSalesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
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
  const deleteSale = useDeleteSale();
  const bulkDeleteSales = useBulkDeleteSales();

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, productFilter, startDate, endDate]);

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
    isLoading: salesLoading || productsLoading,
    paginationMeta,

    currentPage,
    setCurrentPage,
    pageSize,

    deleteDialogOpen,
    setDeleteDialogOpen,

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
  };
}
