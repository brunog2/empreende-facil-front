import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCustomers,
  useCustomersWithFilters,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useBulkDeleteCustomers,
} from "@/hooks/use-customers";
import type { CustomerFilters } from "@/types/customers";

const customerSchema = z.object({
  name: z.string().min(1, "O nome do cliente é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export function useCustomersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
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
  const backendFilters: CustomerFilters = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
  };

  // Sempre usar hook com filtros (que inclui paginação)
  const { data: paginatedData, isLoading } =
    useCustomersWithFilters(backendFilters);

  const customers = paginatedData?.data || [];
  const paginationMeta = paginatedData?.meta || null;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const bulkDeleteCustomers = useBulkDeleteCustomers();

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

  // Buscar cliente individual quando estiver editando (pode não estar na página atual)
  const { data: individualEditingCustomer } = useCustomer(editingCustomerId);
  const editingCustomer = editingCustomerId
    ? customers.find((c) => c.id === editingCustomerId) ||
      individualEditingCustomer
    : null;

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  const handleOpenDialog = (customerId?: string) => {
    if (customerId) {
      setEditingCustomerId(customerId);
      // O editingCustomer será atualizado via useCustomer hook e useEffect abaixo
    } else {
      setEditingCustomerId(null);
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  // Preencher formulário quando editingCustomer estiver disponível
  useEffect(() => {
    if (editingCustomer && editingCustomerId && dialogOpen) {
      form.reset({
        name: editingCustomer.name,
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        address: editingCustomer.address || "",
        notes: editingCustomer.notes || "",
      });
    }
  }, [editingCustomer, editingCustomerId, dialogOpen, form]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomerId(null);
    form.reset();
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomerId) {
        await updateCustomer.mutateAsync({
          id: editingCustomerId,
          data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            notes: data.notes || null,
          },
        });
      } else {
        await createCustomer.mutateAsync({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          notes: data.notes || null,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer.mutateAsync(customerToDelete);
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  // Selection logic
  const toggleSelect = (customerId: string) => {
    setSelectedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === customers.length && customers.length > 0) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map((c) => c.id)));
    }
  };

  const clearSelection = () => {
    setSelectedCustomers(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (selectedCustomers.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedCustomers.size > 0) {
      try {
        await bulkDeleteCustomers.mutateAsync(Array.from(selectedCustomers));
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  return {
    // Data
    customers,
    editingCustomer,
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
    deleteCustomer,

    // Bulk Delete
    selectedCustomers,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleBulkDeleteClick,
    handleConfirmBulkDelete,
    bulkDeleteCustomers,

    // Filters
    filtersForm,
    showFilters,
    setShowFilters,
    hasActiveFilters: !!searchTerm,
    clearFilters,

    // Mutations
    createCustomer,
    updateCustomer,
  };
}
