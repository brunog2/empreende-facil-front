import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { CustomersShimmer } from "@/components/shimmer/CustomersShimmer";
import { useCustomersPage } from "@/hooks/use-customers-page";

export default function Customers() {
  const {
    customers,
    editingCustomer,
    isLoading,
    form,
    onSubmit,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleOpenDialog,
    handleCloseDialog,
    handleDeleteClick,
    handleConfirmDelete,
    deleteCustomer,
    createCustomer,
    updateCustomer,
  } = useCustomersPage();

  if (isLoading) {
    return <CustomersShimmer />;
  }

  return (
    <div className="space-y-6 p-6 w-full" style={{ maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Atualize as informações do cliente" : "Cadastre as informações do cliente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  error={form.formState.errors.name?.message}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    error={form.formState.errors.email?.message}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço (Opcional)</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  error={form.formState.errors.address?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  rows={3}
                  placeholder="Informações adicionais sobre o cliente"
                  error={form.formState.errors.notes?.message}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCustomer.isPending || updateCustomer.isPending}
                >
                  {(createCustomer.isPending || updateCustomer.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCustomer ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    <>
                      {editingCustomer ? "Atualizar" : "Criar"} Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {customers.length} cliente(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {customers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-6">
              Nenhum cliente cadastrado ainda
            </div>
          ) : (
            <div className="w-full overflow-x-auto px-6 sm:px-0">
              <Table className="min-w-[600px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      {customer.notes && (
                        <div className="text-sm text-muted-foreground">{customer.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        )}
                        {!customer.email && !customer.phone && (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.address ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {customer.address}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(customer.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(customer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
