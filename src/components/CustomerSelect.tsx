import { useState } from "react";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "O nome do cliente é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  error?: string;
}

export function CustomerSelect({ value, onChange, error }: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const selectedCustomer = customers.find((c) => c.id === value);

  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      const newCustomer = await createCustomer.mutateAsync({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: null,
      });
      onChange(newCustomer.id);
      setCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={isLoading}
          >
            <span className="truncate">
              {selectedCustomer ? selectedCustomer.name : "Selecione um cliente"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar cliente..." />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="mb-2">Nenhum cliente encontrado.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar novo cliente
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Cliente não informado
                </CommandItem>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.name}
                    onSelect={() => {
                      onChange(customer.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {customer.name}
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar novo cliente
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo cliente rapidamente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateCustomer)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Nome Completo *</Label>
              <Input
                id="customer-name"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  {...form.register("email")}
                  error={form.formState.errors.email?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Telefone</Label>
                <PhoneInput
                  id="customer-phone"
                  value={form.watch("phone") || ""}
                  onChange={(value) => form.setValue("phone", value || "", { shouldValidate: true })}
                  error={form.formState.errors.phone?.message}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-address">Endereço</Label>
              <Input
                id="customer-address"
                {...form.register("address")}
                error={form.formState.errors.address?.message}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

