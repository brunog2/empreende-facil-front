import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/use-customers";

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
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const editingCustomer = editingCustomerId
    ? customers.find((c) => c.id === editingCustomerId)
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
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setEditingCustomerId(customerId);
        form.reset({
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          notes: customer.notes || "",
        });
      }
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

  return {
    // Data
    customers,
    editingCustomer,
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
    deleteCustomer,
    
    // Mutations
    createCustomer,
    updateCustomer,
  };
}

