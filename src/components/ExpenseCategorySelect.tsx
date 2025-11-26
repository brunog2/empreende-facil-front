import { useState } from "react";
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
});

type CategoryFormData = z.infer<typeof categorySchema>;

const defaultCategories = [
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Telefone",
  "Salários",
  "Impostos",
  "Matéria-prima",
  "Manutenção",
  "Marketing",
  "Outros",
];

interface ExpenseCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  categories?: string[];
}

export function ExpenseCategorySelect({ 
  value, 
  onChange, 
  error,
  categories = defaultCategories 
}: ExpenseCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const allCategories = [...categories, ...customCategories];

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreateCategory = async (data: CategoryFormData) => {
    if (!allCategories.includes(data.name)) {
      setCustomCategories([...customCategories, data.name]);
      onChange(data.name);
      setCreateDialogOpen(false);
      form.reset();
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
            {value || "Selecione uma categoria"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar categoria..." />
            <CommandList>
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
                {allCategories.map((category) => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => {
                      onChange(category);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category}
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria de Despesa</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para suas despesas
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateCategory)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria *</Label>
              <Input
                id="category-name"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
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
              <Button type="submit">
                Criar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


