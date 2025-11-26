import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { User, Loader2, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";

const profileSchema = z.object({
  fullName: z.string().min(1, "O nome completo é obrigatório"),
  businessName: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        businessName: user.businessName || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await api.patch<{
        data: {
          id: string;
          email: string;
          fullName: string;
          businessName: string | null;
          phone: string | null;
        };
      }>("/users/me", {
        fullName: data.fullName,
        businessName: data.businessName || null,
        phone: data.phone || null,
      });

      toast.success("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (error) {
      toast.error(getErrorMessage(error) || "Erro ao atualizar perfil");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Fazer logout e limpar cache
      queryClient.clear();
      queryClient.removeQueries();
      localStorage.clear();

      // Excluir a conta do usuário
      await api.delete("/users/me");

      toast.success("Conta excluída com sucesso");
      navigate("/auth");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Erro ao excluir conta");
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                error={form.formState.errors.fullName?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Negócio (Opcional)</Label>
              <Input
                id="businessName"
                {...form.register("businessName")}
                error={form.formState.errors.businessName?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <PhoneInput
                id="phone"
                value={form.watch("phone") || ""}
                onChange={(value) => form.setValue("phone", value || "", { shouldValidate: true })}
                error={form.formState.errors.phone?.message}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis relacionadas à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Excluir Conta</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ao excluir sua conta, todos os seus dados serão permanentemente removidos, 
              incluindo produtos, vendas, despesas, clientes e categorias. Esta ação não pode ser desfeita.
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong> e 
              todos os seus dados serão permanentemente removidos:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos os produtos</li>
                <li>Todas as vendas</li>
                <li>Todas as despesas</li>
                <li>Todos os clientes</li>
                <li>Todas as categorias</li>
                <li>Seu perfil</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
