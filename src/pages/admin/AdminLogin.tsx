import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/hooks/use-auth";
import { UserPermission, UserRole } from "@/types/admin";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User & {
      role: UserRole;
      permissions: UserPermission[];
    };
  };
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;

    api
      .get<{ data: User }>("/auth/me")
      .then(({ data }) => {
        navigate(data.data.role === "admin" ? "/admin" : "/");
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  }, [navigate]);

  const handleLogin = async (data: LoginForm) => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);
      const payload = response.data.data;

      if (payload.user.role !== "admin") {
        toast.error("Esta conta não possui acesso administrativo");
        return;
      }

      localStorage.setItem("accessToken", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
      toast.success("Bem-vindo ao painel administrativo");
      navigate("/admin");
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(
        message.includes("Credenciais inválidas")
          ? "Email ou senha incorretos"
          : message,
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.1),transparent_30%)]" />
      <Card className="relative w-full max-w-md border-sidebar-border shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-3xl">
              Gestão Pro Admin
            </CardTitle>
            <CardDescription className="mt-2">
              Controle de contas e acessos da plataforma
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email administrativo</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                placeholder="admin@suaempresa.com"
                {...form.register("email")}
                error={form.formState.errors.email?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
                error={form.formState.errors.password?.message}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="mr-2 h-4 w-4" />
              )}
              Entrar como administrador
            </Button>
          </form>

          <div className="mt-6 border-t pt-5 text-center">
            <Link
              to="/auth"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Voltar para o acesso de clientes
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
