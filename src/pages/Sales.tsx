import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Sale {
  id: string;
  total_amount: number;
  payment_method: string | null;
  sale_date: string;
  customers: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  sale_price: number;
  stock_quantity: number;
}

interface Customer {
  id: string;
  name: string;
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    payment_method: "dinheiro",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [salesResult, productsResult, customersResult] = await Promise.all([
      supabase
        .from("sales")
        .select("*, customers(name)")
        .order("sale_date", { ascending: false }),
      supabase.from("products").select("id, name, sale_price, stock_quantity"),
      supabase.from("customers").select("id, name"),
    ]);

    if (salesResult.error) toast.error("Erro ao carregar vendas");
    if (productsResult.error) toast.error("Erro ao carregar produtos");
    if (customersResult.error) toast.error("Erro ao carregar clientes");

    setSales(salesResult.data || []);
    setProducts(productsResult.data || []);
    setCustomers(customersResult.data || []);
    setLoading(false);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...saleItems];
    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          product_id: value as string,
          unit_price: product.sale_price,
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setSaleItems(newItems);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      toast.error("Adicione pelo menos um produto à venda");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const totalAmount = calculateTotal();

    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          user_id: user.id,
          customer_id: formData.customer_id || null,
          total_amount: totalAmount,
          payment_method: formData.payment_method,
          notes: formData.notes || null,
        },
      ])
      .select()
      .single();

    if (saleError) {
      toast.error("Erro ao criar venda");
      return;
    }

    const saleItemsData = saleItems.map((item) => ({
      sale_id: saleData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItemsData);

    if (itemsError) {
      toast.error("Erro ao adicionar itens da venda");
      await supabase.from("sales").delete().eq("id", saleData.id);
      return;
    }

    toast.success("Venda realizada com sucesso!");
    setDialogOpen(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      payment_method: "dinheiro",
      notes: "",
    });
    setSaleItems([]);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">Registre e acompanhe suas vendas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Venda</DialogTitle>
              <DialogDescription>
                Adicione os produtos vendidos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente (Opcional)</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Produtos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSaleItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>

                {saleItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Produto</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateSaleItem(index, "product_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem 
                              key={product.id} 
                              value={product.id}
                              disabled={product.stock_quantity === 0}
                            >
                              {product.name} (Estoque: {product.stock_quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateSaleItem(index, "quantity", parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Preço Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateSaleItem(index, "unit_price", parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSaleItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Finalizar Venda
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            {sales.length} venda(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma venda registrada ainda
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {sale.customers?.name || "Cliente não informado"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {sale.payment_method?.replace("_", " ") || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
