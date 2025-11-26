import { BaseRepository } from "./base.repository";

export class ExpensesRepository extends BaseRepository<"expenses"> {
  constructor() {
    super("expenses");
  }

  async getMonthlyTotal(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await this.getTable()
      .select("amount")
      .eq("user_id", userId)
      .gte("expense_date", startDate.toISOString())
      .lte("expense_date", endDate.toISOString());

    if (error) {
      throw new Error(`Erro ao buscar total de despesas: ${error.message}`);
    }

    return (data || []).reduce((sum, expense) => sum + Number(expense.amount), 0);
  }

  async findByCategory(userId: string, category: string): Promise<ReturnType<typeof this.findAll>> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("expense_date", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar despesas por categoria: ${error.message}`);
    }

    return data || [];
  }

  async findByRecurrence(userId: string, isRecurring: boolean): Promise<ReturnType<typeof this.findAll>> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .eq("is_recurring", isRecurring)
      .order("expense_date", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar despesas recorrentes: ${error.message}`);
    }

    return data || [];
  }
}


