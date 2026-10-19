import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Loader2,
  Pencil,
  Search,
  Trash2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteManagedUser,
  useManagedUsers,
  useUpdateManagedUser,
} from "@/hooks/use-admin";
import { getErrorMessage } from "@/lib/api";
import {
  ManagedUser,
  PERMISSION_OPTIONS,
  UserPermission,
} from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "all" | "active" | "inactive";

interface EditForm {
  email: string;
  fullName: string;
  businessName: string;
  phone: string;
  isActive: boolean;
  permissions: UserPermission[];
}

const emptyForm: EditForm = {
  email: "",
  fullName: "",
  businessName: "",
  phone: "",
  isActive: true,
  permissions: [],
};

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const filters = useMemo(
    () => ({ page, limit: 10, search: search || undefined, status }),
    [page, search, status],
  );
  const { data, isLoading, isFetching } = useManagedUsers(filters);
  const updateUser = useUpdateManagedUser();
  const removeUser = useDeleteManagedUser();

  const openEditDialog = (user: ManagedUser) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      fullName: user.fullName,
      businessName: user.businessName || "",
      phone: user.phone || "",
      isActive: user.isActive,
      permissions: user.permissions,
    });
  };

  const togglePermission = (
    permission: UserPermission,
    checked: boolean,
  ) => {
    setForm((current) => {
      const next = new Set(current.permissions);
      if (checked) {
        next.add(permission);
        if (permission === "dashboard") {
          ["sales", "products", "categories", "expenses"].forEach((item) =>
            next.add(item as UserPermission),
          );
        }
      } else {
        next.delete(permission);
        if (
          ["sales", "products", "categories", "expenses"].includes(permission)
        ) {
          next.delete("dashboard");
        }
      }
      return { ...current, permissions: Array.from(next) };
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        businessName: form.businessName.trim() || null,
        phone: form.phone.trim() || null,
        isActive: form.isActive,
        permissions: form.permissions,
      });
      toast.success("Conta atualizada com sucesso");
      setEditingUser(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await removeUser.mutateAsync(deleteUser.id);
      toast.success("Conta e dados relacionados foram excluídos");
      setDeleteUser(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <UserRoundCog className="h-4 w-4" />
          Gestão de acessos
        </div>
        <h1 className="font-display text-3xl font-bold">
          Contas da plataforma
        </h1>
        <p className="text-muted-foreground">
          Edite dados, controle acessos e defina permissões por conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Encontre rapidamente uma pessoa ou empresa cadastrada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
                placeholder="Buscar por nome, email ou negócio..."
              />
            </div>
            <Select
              value={status}
              onValueChange={(value: StatusFilter) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Contas ativas</SelectItem>
                <SelectItem value="inactive">Contas bloqueadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5" />
                Clientes cadastrados
              </CardTitle>
              <CardDescription>
                {data
                  ? `${data.meta.total} conta(s) encontrada(s)`
                  : "Carregando contas..."}
              </CardDescription>
            </div>
            {isFetching && !isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="space-y-3 px-6 pb-6 sm:px-0">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.data.length ? (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conta</TableHead>
                      <TableHead>Negócio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead>Último acesso</TableHead>
                      <TableHead>Permissões</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>{user.businessName || "Não informado"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "destructive"}
                            className="gap-1"
                          >
                            {user.isActive ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Ban className="h-3 w-3" />
                            )}
                            {user.isActive ? "Ativa" : "Bloqueada"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant="outline">
                              {user.usage?.products || 0} produtos
                            </Badge>
                            <Badge variant="outline">
                              {user.usage?.sales || 0} vendas
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.lastLoginAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.permissions.length} de{" "}
                            {PERMISSION_OPTIONS.length}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar conta"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Excluir conta"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t px-6 py-4 sm:px-0 sm:pb-0">
                <p className="text-sm text-muted-foreground">
                  Página {data.meta.page} de {data.meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.meta.totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Próxima
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <UsersRound className="mx-auto mb-3 h-10 w-10 opacity-40" />
              Nenhuma conta encontrada com os filtros informados.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
            <DialogDescription>
              Atualize os dados, o status e os módulos disponíveis para esta
              conta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="managed-full-name">Nome completo</Label>
                <Input
                  id="managed-full-name"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm({ ...form, fullName: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managed-email">Email</Label>
                <Input
                  id="managed-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managed-business">Nome do negócio</Label>
                <Input
                  id="managed-business"
                  value={form.businessName}
                  onChange={(event) =>
                    setForm({ ...form, businessName: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managed-phone">Telefone</Label>
                <Input
                  id="managed-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="managed-status" className="font-medium">
                  Acesso à plataforma
                </Label>
                <p className="text-sm text-muted-foreground">
                  Contas bloqueadas não conseguem autenticar ou renovar sessão.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {form.isActive ? "Ativo" : "Bloqueado"}
                </span>
                <Switch
                  id="managed-status"
                  checked={form.isActive}
                  onCheckedChange={(isActive) =>
                    setForm({ ...form, isActive })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-base">Permissões por módulo</Label>
                <p className="text-sm text-muted-foreground">
                  A visão geral inclui automaticamente vendas, produtos,
                  categorias e despesas.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERMISSION_OPTIONS.map((permission) => {
                  const checked = form.permissions.includes(permission.value);
                  return (
                    <label
                      key={permission.value}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          togglePermission(permission.value, value === true)
                        }
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {permission.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateUser.isPending}>
              {updateUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta conta?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta de <strong>{deleteUser?.fullName}</strong> e todos os
              produtos, vendas, despesas, clientes e categorias relacionados
              serão removidos permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={removeUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

