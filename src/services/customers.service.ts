import { CustomersRepository } from "./repositories/customers.repository";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export class CustomersService {
  private repository: CustomersRepository;

  constructor() {
    this.repository = new CustomersRepository();
  }

  async getAllCustomers(userId: string) {
    return this.repository.findAll(userId);
  }

  async getCustomerById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async createCustomer(data: TablesInsert<"customers">) {
    // Validações de negócio
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("O nome do cliente é obrigatório");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Email inválido");
    }

    return this.repository.create({
      ...data,
      name: data.name.trim(),
    });
  }

  async updateCustomer(id: string, userId: string, data: TablesUpdate<"customers">) {
    // Validações de negócio
    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      throw new Error("O nome do cliente é obrigatório");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Email inválido");
    }

    const updateData = { ...data };
    if (data.name) {
      updateData.name = data.name.trim();
    }

    return this.repository.update(id, userId, updateData);
  }

  async deleteCustomer(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async searchCustomers(userId: string, query: string) {
    return this.repository.search(userId, query);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}


