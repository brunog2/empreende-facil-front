import { useState } from "react";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategorySelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  error?: string;
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const selectedCategory = categories.find((cat) => cat.id === value || cat.name === value);

  const handleCreateCategory = async (data: CategoryFormData, e?: React.BaseSyntheticEvent) => {
    // Prevenir propagação do evento para não submeter formulários pais
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const newCategory = await createCategory.mutateAsync(data);
      // Usar o ID da categoria para manter consistência com o backend
      onChange(newCategory.id);
      // Fechar apenas o modal de categoria, sem afetar outros modais
      form.reset();
      // Usar requestAnimationFrame para garantir que o fechamento aconteça após o estado ser atualizado
      requestAnimationFrame(() => {
        setCreateDialogOpen(false);
      });
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
          >
            {value ? (selectedCategory?.name || value) : "Selecione uma categoria"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-[60]" align="start" sideOffset={4}>
          <Command shouldFilter={true}>
            <CommandInput placeholder="Buscar categoria..." />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="mb-2">Nenhuma categoria encontrada.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar nova categoria
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="sem categoria"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value || value === "" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Sem categoria
                </CommandItem>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.name || value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
                <CommandItem
                  value="criar nova categoria"
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar nova categoria
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      <Dialog 
        open={createDialogOpen} 
        onOpenChange={(open) => {
          // Só permite fechar se não estiver em processo de criação
          if (createCategory.isPending) {
            // Se estiver criando, não permitir fechar
            return;
          }
          // Atualizar estado normalmente
          setCreateDialogOpen(open);
        }}
      >
        <DialogContent
          className="z-[60]"
          onInteractOutside={(e) => {
            // Previne fechamento ao clicar fora quando está dentro de outro Dialog
            // Verifica se há outro Dialog aberto (z-index maior)
            const dialogs = document.querySelectorAll('[role="dialog"]');
            if (dialogs.length > 1) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Permite fechar com ESC apenas se não estiver criando
            if (createCategory.isPending) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para seus produtos
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(handleCreateCategory)(e);
            }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria *</Label>
              <Input
                id="category-name"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Input
                id="category-description"
                {...form.register("description")}
                error={form.formState.errors.description?.message}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createCategory.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

