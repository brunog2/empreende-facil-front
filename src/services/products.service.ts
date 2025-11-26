import { ProductsRepository } from "./repositories/products.repository";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export class ProductsService {
  private repository: ProductsRepository;

  constructor() {
    this.repository = new ProductsRepository();
  }

  async getAllProducts(userId: string) {
    return this.repository.findAll(userId);
  }

  async getProductById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async createProduct(data: TablesInsert<"products">) {
    // Validações de negócio
    if (data.sale_price < data.cost_price) {
      throw new Error("O preço de venda não pode ser menor que o preço de custo");
    }

    if (data.stock_quantity < 0) {
      throw new Error("A quantidade em estoque não pode ser negativa");
    }

    return this.repository.create(data);
  }

  async updateProduct(id: string, userId: string, data: TablesUpdate<"products">) {
    // Validações de negócio
    if (data.sale_price !== undefined && data.cost_price !== undefined) {
      if (data.sale_price < data.cost_price) {
        throw new Error("O preço de venda não pode ser menor que o preço de custo");
      }
    }

    if (data.stock_quantity !== undefined && data.stock_quantity < 0) {
      throw new Error("A quantidade em estoque não pode ser negativa");
    }

    return this.repository.update(id, userId, data);
  }

  async deleteProduct(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async getProductsByCategory(userId: string, category: string) {
    return this.repository.findByCategory(userId, category);
  }

  async getLowStockProducts(userId: string) {
    return this.repository.findLowStock(userId);
  }
}


