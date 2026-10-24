import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSale, useSale, useUpdateSale } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { clearSaleDraft, readSaleDraft, saveSaleDraft, type SaleDraft } from "@/lib/sale-draft";
import type { Sale } from "@/types/sales";

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
  .refine((data) => data.items.every((item) => item.productId !== ""), {
    message: "Todos os produtos devem ser selecionados",
    path: ["items"],
  });

export type SaleFormData = z.infer<typeof saleSchema>;

function currentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function emptySale(): SaleFormData {
  return {
    customerId: null,
    paymentMethod: "dinheiro",
    notes: "",
    saleDate: new Date().toISOString().split("T")[0],
    saleTime: currentTime(),
    items: [{ productId: "", quantity: 1, unitPrice: 0 }],
  };
}

function saleToForm(sale: Sale): SaleFormData {
  let saleDateStr = new Date().toISOString().split("T")[0];
  let saleTimeStr = currentTime();
  if (sale.saleDate) {
    saleDateStr = sale.saleDate.split("T")[0];
    const timeMatch = sale.saleDate.match(/T(\d{2}):(\d{2})/);
    if (timeMatch) saleTimeStr = `${timeMatch[1]}:${timeMatch[2]}`;
  }
  return {
    customerId: sale.customerId || null,
    paymentMethod: sale.paymentMethod || "dinheiro",
    notes: sale.notes || "",
    saleDate: saleDateStr,
    saleTime: saleTimeStr,
    items: sale.saleItems.map((item) => ({
      productId: item.productId || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

function quantityMap(items: SaleFormData["items"]) {
  return Object.fromEntries(items.map((item, index) => [index, String(item.quantity)]));
}

export function useSaleForm(saleId?: string) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = saleId ? `/vendas/${saleId}/editar` : "/vendas/nova";
  const { data: editingSale, isLoading: saleLoading } = useSale(saleId ?? null);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();
  const hydrated = useRef(false);
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({ 0: "1" });
  const [pendingProduct, setPendingProduct] = useState<{ id: string; line: number } | null>(null);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: emptySale(),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (hydrated.current) return;
    if (saleId && (saleLoading || !editingSale)) return;

    const produto = searchParams.get("produto");
    const restoring = searchParams.get("rascunho") === "1" || Boolean(produto);
    const draft = readSaleDraft();

    if (restoring && draft?.returnTo === returnTo) {
      form.reset(draft.values);
      const restored: Record<number, string> = {};
      Object.entries(draft.quantityInputs || {}).forEach(([key, value]) => {
        restored[Number(key)] = value;
      });
      setQuantityInputs(restored);
      if (produto) setPendingProduct({ id: produto, line: draft.lineIndex });
    } else if (editingSale) {
      const values = saleToForm(editingSale);
      form.reset(values);
      setQuantityInputs(quantityMap(values.items));
      clearSaleDraft();
    } else {
      const values = emptySale();
      form.reset(values);
      setQuantityInputs(quantityMap(values.items));
      clearSaleDraft();
    }

    hydrated.current = true;
  }, [saleId, saleLoading, editingSale, form, returnTo, searchParams]);

  const updateSaleItem = (
    index: number,
    field: keyof SaleFormData["items"][number],
    value: string | number,
  ) => {
    const currentItem = form.getValues(`items.${index}`);
    const fieldPath = `items.${index}.${field}` as Path<SaleFormData>;
    if (field === "productId") {
      const product = products.find((item) => item.id === value);
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
      update(index, { ...currentItem, [field]: value });
    }
    form.clearErrors(fieldPath);
  };

  useEffect(() => {
    if (!pendingProduct) return;
    const product = products.find((item) => item.id === pendingProduct.id);
    if (!product) return;
    updateSaleItem(pendingProduct.line, "productId", product.id);
    setPendingProduct(null);
    // updateSaleItem fecha sobre os produtos já carregados
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingProduct, products]);

  const addSaleItem = () => {
    const next = form.getValues("items").length;
    append({ productId: "", quantity: 1, unitPrice: 0 });
    setQuantityInputs((prev) => ({ ...prev, [next]: "1" }));
  };

  const removeSaleItem = (index: number) => {
    remove(index);
    setQuantityInputs((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const current = Number(key);
        if (current < index) next[current] = value;
        if (current > index) next[current - 1] = value;
      });
      return next;
    });
  };

  const items = form.watch("items");
  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const costOfGoods = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + Number(item.quantity || 0) * Number(product?.costPrice || 0);
  }, 0);
  const profit = total - costOfGoods;

  const lineProfit = (index: number) => {
    const item = items[index];
    if (!item?.productId) return null;
    const product = products.find((entry) => entry.id === item.productId);
    const revenue = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    const cost = Number(item.quantity || 0) * Number(product?.costPrice || 0);
    return { revenue, cost, profit: revenue - cost };
  };

  const onSubmit = async (data: SaleFormData) => {
    try {
      const saleItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      const [year, month, day] = data.saleDate.split("-").map(Number);
      const [hours, minutes] = data.saleTime.split(":").map(Number);
      const saleDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
      const payload = {
        customerId: data.customerId || null,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        saleDate: saleDateTime,
        items: saleItems,
        totalAmount: data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      };

      if (saleId) {
        await updateSale.mutateAsync({ id: saleId, data: payload });
      } else {
        await createSale.mutateAsync(payload);
      }
      clearSaleDraft();
      navigate("/vendas");
    } catch {
      // O hook de venda já mostra o erro.
    }
  };

  const cancel = () => {
    clearSaleDraft();
    navigate("/vendas");
  };

  const startProductCreate = (lineIndex: number) => {
    saveSaleDraft({
      returnTo,
      lineIndex,
      values: form.getValues() as SaleDraft["values"],
      quantityInputs: Object.fromEntries(
        Object.entries(quantityInputs).map(([key, value]) => [key, value]),
      ),
    });
    navigate(`/produtos/novo?retorno=${encodeURIComponent(returnTo)}`);
  };

  return {
    form,
    fields,
    products,
    editingSale,
    isLoading: Boolean(saleId) && (saleLoading || !hydrated.current) || productsLoading,
    isSaving: createSale.isPending || updateSale.isPending,
    quantityInputs,
    setQuantityInputs,
    addSaleItem,
    updateSaleItem,
    removeSaleItem,
    total,
    costOfGoods,
    profit,
    lineProfit,
    onSubmit,
    cancel,
    startProductCreate,
  };
}
