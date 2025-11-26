import { BaseRepository } from "./base.repository";
import type { Tables } from "@/integrations/supabase/types";

export class ProductsRepository extends BaseRepository<"products"> {
  constructor() {
    super("products");
  }

  async findByCategory(userId: string, category: string): Promise<Tables<"products">[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .eq("category", category);

    if (error) {
      throw new Error(`Erro ao buscar produtos por categoria: ${error.message}`);
    }

    return data || [];
  }

  async findLowStock(userId: string): Promise<Tables<"products">[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Erro ao buscar produtos com estoque baixo: ${error.message}`);
    }

    return (data || []).filter(
      (p) => p.stock_quantity <= 0
    );
  }
}

