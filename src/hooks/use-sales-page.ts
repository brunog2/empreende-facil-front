import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSales,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
  type Sale,
} from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";

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
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();

  const editingSale = editingSaleId
    ? sales.find((s) => s.id === editingSaleId)
    : null;

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: null,
      paymentMethod: "dinheiro",
      notes: "",
      saleDate: new Date().toISOString().split("T")[0],
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

  const handleOpenDialog = (saleId?: string) => {
    if (saleId) {
      const sale = sales.find((s) => s.id === saleId);
      if (sale) {
        setEditingSaleId(saleId);
        form.reset({
          customerId: sale.customerId || null,
          paymentMethod: sale.paymentMethod || "dinheiro",
          notes: sale.notes || "",
          saleDate: sale.saleDate
            ? new Date(sale.saleDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          items: sale.saleItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
      }
    } else {
      setEditingSaleId(null);
      form.reset({
        customerId: null,
        paymentMethod: "dinheiro",
        notes: "",
        saleDate: new Date().toISOString().split("T")[0],
        items: [{ productId: "", quantity: 1, unitPrice: 0 }],
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

      if (editingSaleId) {
        await updateSale.mutateAsync({
          id: editingSaleId,
          data: {
            customerId: data.customerId || null,
            paymentMethod: data.paymentMethod,
            notes: data.notes || null,
            saleDate: new Date(data.saleDate),
            items: saleItems,
            totalAmount,
          },
        });
      } else {
        await createSale.mutateAsync({
          customerId: data.customerId || null,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          saleDate: new Date(data.saleDate),
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

  return {
    // Data
    sales,
    products,
    editingSale,
    isLoading: salesLoading || productsLoading,

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

    // Mutations
    createSale,
    updateSale,
  };
}
