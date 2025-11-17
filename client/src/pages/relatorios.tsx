import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseCategory } from "@shared/schema";

const categoryLabels: Record<ExpenseCategory, string> = {
  ingredientes: "Ingredientes",
  fornecedores: "Fornecedores",
  agua_luz_gas: "Água/Luz/Gás",
  salarios: "Salários",
  aluguel: "Aluguel",
  manutencao: "Manutenção",
  outros: "Outros",
};

export default function Relatorios() {
  const [period, setPeriod] = useState("mes");

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalSales: number;
    totalReceived: number;
    totalPending: number;
    totalExpenses: number;
    netProfit: number;
  }>({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: expensesByCategory, isLoading: expensesLoading } = useQuery<
    { category: ExpenseCategory; total: number }[]
  >({
    queryKey: ["/api/analytics/expenses-by-category"],
  });

  const formatCurrency = (value: number) => value.toFixed(2);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-medium mb-2" data-testid="text-reports-title">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho financeiro</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48" data-testid="select-period">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium">
                R$ {formatCurrency(analytics?.totalSales || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium text-chart-4">
                R$ {formatCurrency(analytics?.totalReceived || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                A Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium text-destructive">
                R$ {formatCurrency(analytics?.totalPending || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-medium">
                R$ {formatCurrency(analytics?.totalExpenses || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-mono font-medium ${(analytics?.netProfit || 0) >= 0 ? "text-chart-4" : "text-destructive"}`}>
                R$ {formatCurrency(analytics?.netProfit || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card data-testid="card-category-breakdown">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expensesByCategory && expensesByCategory.length > 0 ? (
            <div className="space-y-4">
              {expensesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{categoryLabels[item.category]}</p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ 
                          width: `${((item.total / (analytics?.totalExpenses || 1)) * 100).toFixed(0)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-lg">
                      R$ {formatCurrency(item.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((item.total / (analytics?.totalExpenses || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma despesa registrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
