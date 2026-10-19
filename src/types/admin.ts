export type UserRole = "admin" | "customer";

export type UserPermission =
  | "dashboard"
  | "sales"
  | "products"
  | "categories"
  | "customers"
  | "expenses"
  | "reports";

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  businessName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  permissions: UserPermission[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  usage?: {
    products: number;
    sales: number;
    customers: number;
  };
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  recentUsers: ManagedUser[];
}

export interface ManagedUsersResponse {
  data: ManagedUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PERMISSION_OPTIONS: Array<{
  value: UserPermission;
  label: string;
  description: string;
}> = [
  {
    value: "dashboard",
    label: "Visão geral",
    description: "Indicadores e resumo completo do negócio.",
  },
  {
    value: "sales",
    label: "Vendas",
    description: "Consultar, registrar, editar e excluir vendas.",
  },
  {
    value: "products",
    label: "Produtos",
    description: "Gerenciar produtos, preços e estoque.",
  },
  {
    value: "categories",
    label: "Categorias",
    description: "Organizar e gerenciar categorias.",
  },
  {
    value: "customers",
    label: "Clientes",
    description: "Gerenciar a base de clientes do negócio.",
  },
  {
    value: "expenses",
    label: "Despesas",
    description: "Consultar e gerenciar despesas.",
  },
  {
    value: "reports",
    label: "Relatórios",
    description: "Consultar relatórios disponíveis no plano contratado.",
  },
];
