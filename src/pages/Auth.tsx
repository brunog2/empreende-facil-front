import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "O email é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const signupSchema = z.object({
  fullName: z.string().min(1, "O nome completo é obrigatório"),
  businessName: z.string().optional(),
  email: z.string().email("Email inválido").min(1, "O email é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "adm@adm.com",
      password: "123456",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Verificar se já está autenticado
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Validar token chamando a API
      api
        .get("/auth/me")
        .then(() => {
          navigate("/");
        })
        .catch(() => {
          // Token inválido, limpar e continuar na página de auth
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        });
    }
  }, [navigate]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await api.post<{
        data: {
          accessToken: string;
          refreshToken: string;
          user: {
            id: string;
            email: string;
            fullName: string;
            businessName: string | null;
            phone: string | null;
          };
        };
      }>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken } = response.data.data;

      // Salvar tokens no localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      // Traduzir mensagens de erro comuns
      let translatedMessage = errorMessage;
      if (errorMessage.includes("Credenciais inválidas")) {
        translatedMessage = "Email ou senha incorretos";
      } else if (errorMessage.includes("Too many requests")) {
        translatedMessage = "Muitas tentativas. Tente novamente mais tarde";
      }
      toast.error(translatedMessage);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      const response = await api.post<{
        data: {
          accessToken: string;
          refreshToken: string;
          user: {
            id: string;
            email: string;
            fullName: string;
            businessName: string | null;
            phone: string | null;
          };
        };
      }>("/auth/register", {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        businessName: data.businessName || undefined,
      });

      const { accessToken, refreshToken } = response.data.data;

      // Salvar tokens no localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Conta criada com sucesso! Você pode fazer login agora.");
      // Resetar formulário após sucesso
      signupForm.reset();
      // Mudar para aba de login
      setActiveTab("login");
      navigate("/");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      // Traduzir mensagens de erro comuns
      let translatedMessage = errorMessage;
      if (errorMessage.includes("Email já está em uso")) {
        translatedMessage = "Este email já está cadastrado";
      } else if (errorMessage.includes("senha deve ter pelo menos")) {
        translatedMessage = "A senha deve ter pelo menos 6 caracteres";
      } else if (errorMessage.includes("Email inválido")) {
        translatedMessage = "Email inválido";
      }
      toast.error(translatedMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-3xl">Gestão Pro</CardTitle>
          <CardDescription>
            Gerencie seu negócio com simplicidade e eficiência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...loginForm.register("email")}
                    error={loginForm.formState.errors.email?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                    error={loginForm.formState.errors.password?.message}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={signupForm.handleSubmit(handleSignup)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo *</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    {...signupForm.register("fullName")}
                    error={signupForm.formState.errors.fullName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-business">
                    Nome do Negócio (Opcional)
                  </Label>
                  <Input
                    id="signup-business"
                    type="text"
                    placeholder="Minha Loja"
                    {...signupForm.register("businessName")}
                    error={signupForm.formState.errors.businessName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...signupForm.register("email")}
                    error={signupForm.formState.errors.email?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register("password")}
                    error={signupForm.formState.errors.password?.message}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupForm.formState.isSubmitting}
                >
                  {signupForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
