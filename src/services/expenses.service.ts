import { ExpensesRepository } from "./repositories/expenses.repository";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export class ExpensesService {
  private repository: ExpensesRepository;

  constructor() {
    this.repository = new ExpensesRepository();
  }

  async getAllExpenses(userId: string) {
    return this.repository.findAll(userId);
  }

  async getExpenseById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async createExpense(data: TablesInsert<"expenses">) {
    // Validações de negócio
    if (!data.description || data.description.trim().length === 0) {
      throw new Error("A descrição da despesa é obrigatória");
    }

    if (data.amount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero");
    }

    if (!data.category || data.category.trim().length === 0) {
      throw new Error("A categoria da despesa é obrigatória");
    }

    if (data.is_recurring && !data.recurrence_period) {
      throw new Error("Despesas recorrentes devem ter um período de recorrência definido");
    }

    return this.repository.create({
      ...data,
      description: data.description.trim(),
      category: data.category.trim(),
    });
  }

  async updateExpense(id: string, userId: string, data: TablesUpdate<"expenses">) {
    // Validações de negócio
    if (data.description !== undefined && (!data.description || data.description.trim().length === 0)) {
      throw new Error("A descrição da despesa é obrigatória");
    }

    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero");
    }

    if (data.category !== undefined && (!data.category || data.category.trim().length === 0)) {
      throw new Error("A categoria da despesa é obrigatória");
    }

    if (data.is_recurring && !data.recurrence_period) {
      throw new Error("Despesas recorrentes devem ter um período de recorrência definido");
    }

    const updateData = { ...data };
    if (data.description) {
      updateData.description = data.description.trim();
    }
    if (data.category) {
      updateData.category = data.category.trim();
    }

    return this.repository.update(id, userId, updateData);
  }

  async deleteExpense(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async getMonthlyTotal(userId: string, startDate: Date, endDate: Date) {
    return this.repository.getMonthlyTotal(userId, startDate, endDate);
  }

  async getExpensesByCategory(userId: string, category: string) {
    return this.repository.findByCategory(userId, category);
  }

  async getRecurringExpenses(userId: string) {
    return this.repository.findByRecurrence(userId, true);
  }
}


