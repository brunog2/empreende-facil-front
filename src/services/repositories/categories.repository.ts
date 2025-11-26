import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export class CategoriesRepository {
  protected tableName = "categories";

  protected getTable() {
    return supabase.from(this.tableName);
  }

  async findAll(userId: string): Promise<Category[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return (data || []) as Category[];
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Erro ao buscar categoria: ${error.message}`);
    }

    return data as Category | null;
  }

  async create(data: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
    const { data: result, error } = await this.getTable()
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar categoria: ${error.message}`);
    }

    if (!result) {
      throw new Error("Erro ao criar categoria: nenhum dado retornado");
    }

    return result as Category;
  }

  async update(id: string, userId: string, data: Partial<Omit<Category, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Category> {
    const { data: result, error } = await this.getTable()
      .update(data)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar categoria: ${error.message}`);
    }

    if (!result) {
      throw new Error("Erro ao atualizar categoria: nenhum dado retornado");
    }

    return result as Category;
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.getTable()
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Erro ao excluir categoria: ${error.message}`);
    }
  }

  async search(userId: string, query: string): Promise<Category[]> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return (data || []) as Category[];
  }
}
