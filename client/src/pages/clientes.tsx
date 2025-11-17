import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { insertCustomerSchema, type InsertCustomer, type Customer, type Sale } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clientes() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      return await apiRequest("POST", "/api/customers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente cadastrado!",
        description: "O cliente foi adicionado com sucesso.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    createCustomerMutation.mutate(data);
  };

  const customersWithDebt = customers?.filter(c => parseFloat(c.totalDebt) > 0) || [];
  const filteredCustomers = customersWithDebt.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone || "").includes(searchTerm)
  );

  const formatCurrency = (value: string) => parseFloat(value).toFixed(2);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-medium mb-2" data-testid="text-customers-title">Clientes Fiados</h1>
          <p className="text-muted-foreground">Gerencie clientes com pendências de pagamento</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-customer">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do cliente"
                          {...field}
                          data-testid="input-name"
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
                          placeholder="(11) 98765-4321"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-phone"
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
                    disabled={createCustomerMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    data-testid="button-submit-customer"
                    disabled={createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending ? "Salvando..." : "Cadastrar"}
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
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-customers"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-16 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {customersWithDebt.length === 0 
              ? "Nenhum cliente com pendências" 
              : "Nenhum cliente encontrado"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const { data: sales } = useQuery<Sale[]>({
    queryKey: ["/api/customers", customer.id, "sales"],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customer.id}/sales`);
      if (!response.ok) throw new Error("Failed to fetch customer sales");
      return response.json();
    },
  });

  const pendingSales = sales?.filter(s => 
    s.paymentStatus === "fiado" || s.paymentStatus === "parcial"
  ) || [];

  const formatCurrency = (value: string) => parseFloat(value).toFixed(2);

  return (
    <Card data-testid={`card-customer-${customer.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl" data-testid={`text-customer-name-${customer.id}`}>
                {customer.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{customer.phone || "Sem telefone"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Débito Total</p>
            <p className="text-2xl font-mono font-medium text-destructive" data-testid={`text-debt-${customer.id}`}>
              R$ {formatCurrency(customer.totalDebt)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="transactions" className="border-none">
            <AccordionTrigger className="text-sm py-2">
              Ver histórico de pendências ({pendingSales.length})
            </AccordionTrigger>
            <AccordionContent>
              {pendingSales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Nenhuma pendência</p>
              ) : (
                <>
                  <div className="space-y-3 mt-2">
                    {pendingSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                        data-testid={`item-sale-${sale.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{sale.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-medium">
                            R$ {formatCurrency(sale.amount)}
                          </div>
                          <StatusBadge status={sale.paymentStatus} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" data-testid={`button-register-payment-${customer.id}`}>
                      Registrar Pagamento
                    </Button>
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
