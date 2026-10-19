import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarPlus,
  CircleOff,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useAdminOverview } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminOverview();

  const stats = [
    {
      title: "Contas cadastradas",
      value: data?.totalUsers,
      description: "Total de clientes na plataforma",
      icon: UsersRound,
      className: "bg-primary/10 text-primary",
    },
    {
      title: "Contas ativas",
      value: data?.activeUsers,
      description: "Com acesso liberado",
      icon: UserCheck,
      className: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Contas bloqueadas",
      value: data?.inactiveUsers,
      description: "Sem acesso à plataforma",
      icon: CircleOff,
      className: "bg-destructive/10 text-destructive",
    },
    {
      title: "Novos neste mês",
      value: data?.newUsersThisMonth,
      description: "Cadastros no mês atual",
      icon: CalendarPlus,
      className: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Administração da plataforma
          </div>
          <h1 className="font-display text-3xl font-bold">Visão geral</h1>
          <p className="text-muted-foreground">
            Acompanhe o crescimento e a situação das contas cadastradas.
          </p>
        </div>
        <Button onClick={() => navigate("/admin/usuarios")}>
          Gerenciar contas
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.className}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="mb-2 h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Cadastros recentes</CardTitle>
            <CardDescription>
              As últimas contas criadas na plataforma
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/usuarios")}
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-14 w-full" />
              ))}
            </div>
          ) : data?.recentUsers.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead>Negócio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{user.businessName || "Não informado"}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Ativa" : "Bloqueada"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma conta de cliente cadastrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

