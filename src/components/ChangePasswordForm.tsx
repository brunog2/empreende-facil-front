import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { strongPasswordSchema } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/PasswordField";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = form.watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await api.post("/auth/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Senha alterada com sucesso");
      form.reset();
    } catch (error) {
      toast.error(getErrorMessage(error) || "Não foi possível alterar a senha");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Senha atual</Label>
        <PasswordField
          id="current-password"
          autoComplete="current-password"
          {...form.register("currentPassword")}
          error={form.formState.errors.currentPassword?.message}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">Nova senha</Label>
        <PasswordField
          id="new-password"
          autoComplete="new-password"
          tips
          passwordValue={newPassword}
          {...form.register("newPassword")}
          error={form.formState.errors.newPassword?.message}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <PasswordField
          id="confirm-password"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Alterar senha
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
