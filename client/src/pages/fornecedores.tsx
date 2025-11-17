import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSupplierSchema, type InsertSupplier, type Supplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Fornecedores() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      return await apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fornecedor cadastrado!",
        description: "O fornecedor foi adicionado com sucesso.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar fornecedor",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      phone: "",
      category: "",
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    createSupplierMutation.mutate(data);
  };

  const filteredSuppliers = suppliers?.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.phone || "").includes(searchTerm)
  ) || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-medium mb-2" data-testid="text-suppliers-title">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus fornecedores e parceiros</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-supplier">
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fornecedor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da empresa"
                          {...field}
                          data-testid="input-supplier-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Carnes, Bebidas, Hortifruti..."
                          {...field}
                          value={field.value || ""}
                          data-testid="input-supplier-category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 3456-7890"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-supplier-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)} 
                    className="flex-1"
                    disabled={createSupplierMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    data-testid="button-submit-supplier"
                    disabled={createSupplierMutation.isPending}
                  >
                    {createSupplierMutation.isPending ? "Salvando..." : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-suppliers"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {suppliers?.length === 0 
              ? "Nenhum fornecedor cadastrado" 
              : "Nenhum fornecedor encontrado"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} data-testid={`card-supplier-${supplier.id}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate" data-testid={`text-supplier-name-${supplier.id}`}>
                      {supplier.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {supplier.category || "Sem categoria"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{supplier.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Cadastrado em:</span>
                    <span>{new Date(supplier.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
