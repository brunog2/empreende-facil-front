import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-auth";
import { UserPermission } from "@/types/admin";

const permissionPaths: Partial<Record<UserPermission, string>> = {
  dashboard: "/",
  sales: "/vendas",
  products: "/produtos",
  categories: "/categorias",
  customers: "/clientes",
  expenses: "/despesas",
};

export function getFirstAllowedPath(permissions: UserPermission[]) {
  const order: UserPermission[] = [
    "dashboard",
    "sales",
    "products",
    "categories",
    "customers",
    "expenses",
  ];
  const first = order.find((permission) => permissions.includes(permission));
  return first ? permissionPaths[first] || "/" : "/perfil";
}

export function PermissionRoute({
  permission,
  children,
}: {
  permission: UserPermission;
  children: ReactNode;
}) {
  const { data: user } = useCurrentUser();

  if (!user?.permissions.includes(permission)) {
    return <Navigate to={getFirstAllowedPath(user?.permissions || [])} replace />;
  }

  return <>{children}</>;
}

