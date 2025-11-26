import { BaseRepository } from "./base.repository";

export class CustomersRepository extends BaseRepository<"customers"> {
  constructor() {
    super("customers");
  }

  async search(userId: string, query: string): Promise<ReturnType<typeof this.findAll>> {
    const { data, error } = await this.getTable()
      .select("*")
      .eq("user_id", userId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }
}


