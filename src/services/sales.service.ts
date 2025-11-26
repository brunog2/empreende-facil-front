import { SalesRepository } from "./repositories/sales.repository";
import { ProductsRepository } from "./repositories/products.repository";
import type { TablesInsert } from "@/integrations/supabase/types";

export interface CreateSaleData {
  customer_id?: string | null;
  payment_method: string;
  notes?: string | null;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

export class SalesService {
  private repository: SalesRepository;
  private productsRepository: ProductsRepository;

  constructor() {
    this.repository = new SalesRepository();
    this.productsRepository = new ProductsRepository();
  }

  async getAllSales(userId: string) {
    return this.repository.findAllWithRelations(userId);
  }

  async getSaleById(id: string, userId: string) {
    return this.repository.findByIdWithRelations(id, userId);
  }

  async createSale(userId: string, data: CreateSaleData) {
    // Validações de negócio
    if (!data.items || data.items.length === 0) {
      throw new Error("Uma venda deve ter pelo menos um item");
    }

    // Verificar estoque de cada produto
    for (const item of data.items) {
      const product = await this.productsRepository.findById(item.product_id, userId);
      
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.product_id}`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stock_quantity}`);
      }
    }

    // Calcular total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    // Preparar dados da venda
    const saleData: TablesInsert<"sales"> = {
      user_id: userId,
      customer_id: data.customer_id || null,
      total_amount: totalAmount,
      payment_method: data.payment_method,
      notes: data.notes || null,
    };

    // Preparar itens da venda
    const saleItems = data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    return this.repository.createWithItems(saleData, saleItems);
  }

  async updateSale(
    id: string,
    userId: string,
    data: Partial<CreateSaleData>
  ) {
    // Se houver itens, validar estoque
    if (data.items) {
      for (const item of data.items) {
        const product = await this.productsRepository.findById(item.product_id, userId);
        
        if (!product) {
          throw new Error(`Produto não encontrado: ${item.product_id}`);
        }

        // Buscar venda atual para verificar quantidades já vendidas
        const currentSale = await this.repository.findByIdWithRelations(id, userId);
        if (!currentSale) {
          throw new Error("Venda não encontrada");
        }

        // Calcular estoque disponível considerando itens já vendidos
        const currentItem = currentSale.sale_items.find(
          (si) => si.product_id === item.product_id
        );
        const quantityToRestore = currentItem ? currentItem.quantity : 0;
        const availableStock = product.stock_quantity + quantityToRestore;

        if (availableStock < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto ${product.name}. Disponível: ${availableStock}`);
        }
      }
    }

    // Preparar dados de atualização
    const saleData: Partial<TablesInsert<"sales">> = {};
    if (data.customer_id !== undefined) saleData.customer_id = data.customer_id;
    if (data.payment_method) saleData.payment_method = data.payment_method;
    if (data.notes !== undefined) saleData.notes = data.notes;

    // Se houver itens, calcular novo total
    if (data.items) {
      saleData.total_amount = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
    }

    // Preparar itens se fornecidos
    const saleItems = data.items?.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    return this.repository.updateWithItems(id, userId, saleData, saleItems);
  }

  async deleteSale(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async getMonthlyTotal(userId: string, startDate: Date, endDate: Date) {
    return this.repository.getMonthlyTotal(userId, startDate, endDate);
  }

  async getTopProducts(userId: string, limit: number = 5) {
    return this.repository.getTopProducts(userId, limit);
  }
}


