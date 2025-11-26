import { BaseRepository } from "./base.repository";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export interface SaleWithItems extends Tables<"sales"> {
  customers: { name: string } | null;
  sale_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: { name: string } | null;
  }>;
}

export class SalesRepository extends BaseRepository<"sales"> {
  constructor() {
    super("sales");
  }

  async findAllWithRelations(userId: string): Promise<SaleWithItems[]> {
    const { data, error } = await this.getTable()
      .select(`
        *,
        customers(name),
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          products(name)
        )
      `)
      .eq("user_id", userId)
      .order("sale_date", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar vendas: ${error.message}`);
    }

    return (data || []) as SaleWithItems[];
  }

  async findByIdWithRelations(id: string, userId: string): Promise<SaleWithItems | null> {
    const { data, error } = await this.getTable()
      .select(`
        *,
        customers(name),
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          subtotal,
          products(name)
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Erro ao buscar venda: ${error.message}`);
    }

    return data as SaleWithItems | null;
  }

  async createWithItems(
    saleData: TablesInsert<"sales">,
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>
  ): Promise<SaleWithItems> {
    // Criar a venda
    const { data: sale, error: saleError } = await this.getTable()
      .insert(saleData)
      .select()
      .single();

    if (saleError || !sale) {
      throw new Error(`Erro ao criar venda: ${saleError?.message || "Nenhum dado retornado"}`);
    }

    // Criar os itens da venda
    const saleItemsData = items.map((item) => ({
      sale_id: sale.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItemsData);

    if (itemsError) {
      // Rollback: deletar a venda criada
      await this.getTable().delete().eq("id", sale.id);
      throw new Error(`Erro ao criar itens da venda: ${itemsError.message}`);
    }

    // Buscar a venda completa com relações
    const completeSale = await this.findByIdWithRelations(sale.id, sale.user_id);
    if (!completeSale) {
      throw new Error("Erro ao buscar venda criada");
    }

    return completeSale;
  }

  async updateWithItems(
    id: string,
    userId: string,
    saleData: Partial<TablesInsert<"sales">>,
    items?: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>
  ): Promise<SaleWithItems> {
    // Atualizar a venda
    if (Object.keys(saleData).length > 0) {
      const { error: saleError } = await this.getTable()
        .update(saleData)
        .eq("id", id)
        .eq("user_id", userId);

      if (saleError) {
        throw new Error(`Erro ao atualizar venda: ${saleError.message}`);
      }
    }

    // Se houver itens, atualizar
    if (items) {
      // Deletar itens antigos
      const { error: deleteError } = await supabase
        .from("sale_items")
        .delete()
        .eq("sale_id", id);

      if (deleteError) {
        throw new Error(`Erro ao deletar itens antigos: ${deleteError.message}`);
      }

      // Inserir novos itens
      const saleItemsData = items.map((item) => ({
        sale_id: id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItemsData);

      if (itemsError) {
        throw new Error(`Erro ao atualizar itens da venda: ${itemsError.message}`);
      }
    }

    // Buscar a venda atualizada
    const updatedSale = await this.findByIdWithRelations(id, userId);
    if (!updatedSale) {
      throw new Error("Erro ao buscar venda atualizada");
    }

    return updatedSale;
  }

  async getMonthlyTotal(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await this.getTable()
      .select("total_amount")
      .eq("user_id", userId)
      .gte("sale_date", startDate.toISOString())
      .lte("sale_date", endDate.toISOString());

    if (error) {
      throw new Error(`Erro ao buscar total de vendas: ${error.message}`);
    }

    return (data || []).reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  }

  async getTopProducts(userId: string, limit: number = 5): Promise<Array<{
    product_id: string;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }>> {
    const { data, error } = await supabase
      .from("sale_items")
      .select(`
        product_id,
        quantity,
        subtotal,
        products!inner(name, user_id)
      `)
      .eq("products.user_id", userId);

    if (error) {
      throw new Error(`Erro ao buscar produtos mais vendidos: ${error.message}`);
    }

    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    (data || []).forEach((item: any) => {
      const productId = item.product_id;
      const product = productMap.get(productId) || {
        name: item.products?.name || "Produto desconhecido",
        quantity: 0,
        revenue: 0,
      };

      product.quantity += item.quantity;
      product.revenue += Number(item.subtotal);

      productMap.set(productId, product);
    });

    return Array.from(productMap.entries())
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.name,
        total_quantity: data.quantity,
        total_revenue: data.revenue,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit);
  }
}


