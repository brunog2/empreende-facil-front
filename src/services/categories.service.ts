import { CategoriesRepository } from "./repositories/categories.repository";
import type { Category } from "./repositories/categories.repository";

export class CategoriesService {
  private repository: CategoriesRepository;

  constructor() {
    this.repository = new CategoriesRepository();
  }

  async getAllCategories(userId: string) {
    return this.repository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  async createCategory(userId: string, data: { name: string; description?: string | null }) {
    // Validações de negócio
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("O nome da categoria é obrigatório");
    }

    if (data.name.length > 100) {
      throw new Error("O nome da categoria não pode ter mais de 100 caracteres");
    }

    // Verificar se já existe categoria com mesmo nome
    const existing = await this.repository.search(userId, data.name.trim());
    const exactMatch = existing.find(
      (cat) => cat.name.toLowerCase() === data.name.trim().toLowerCase()
    );

    if (exactMatch) {
      throw new Error("Já existe uma categoria com este nome");
    }

    return this.repository.create({
      user_id: userId,
      name: data.name.trim(),
      description: data.description || null,
    });
  }

  async updateCategory(
    id: string,
    userId: string,
    data: { name?: string; description?: string | null }
  ) {
    // Validações de negócio
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error("O nome da categoria é obrigatório");
      }

      if (data.name.length > 100) {
        throw new Error("O nome da categoria não pode ter mais de 100 caracteres");
      }

      // Verificar se já existe outra categoria com mesmo nome
      const existing = await this.repository.search(userId, data.name.trim());
      const exactMatch = existing.find(
        (cat) => cat.id !== id && cat.name.toLowerCase() === data.name.trim().toLowerCase()
      );

      if (exactMatch) {
        throw new Error("Já existe uma categoria com este nome");
      }
    }

    const updateData: Partial<Category> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description;

    return this.repository.update(id, userId, updateData);
  }

  async deleteCategory(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async searchCategories(userId: string, query: string) {
    return this.repository.search(userId, query);
  }
}


