import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Customer, Sale, ExpenseCategory } from "@shared/schema";

const categoryLabels: Record<ExpenseCategory, string> = {
  ingredientes: "Ingredientes",
  fornecedores: "Fornecedores",
  agua_luz_gas: "Água/Luz/Gás",
  salarios: "Salários",
  aluguel: "Aluguel",
  manutencao: "Manutenção",
  outros: "Outros",
};

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalSales: number;
    totalReceived: number;
    totalPending: number;
    totalExpenses: number;
    netProfit: number;
  }>({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: sales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: expensesByCategory, isLoading: expensesLoading } = useQuery<
    { category: ExpenseCategory; total: number }[]
  >({
    queryKey: ["/api/analytics/expenses-by-category"],
  });

  const topDebtors = customers?.filter(c => parseFloat(c.totalDebt) > 0).slice(0, 3) || [];
  const recentSales = sales?.slice(0, 5) || [];

  const expensesChartData = expensesByCategory?.map((item) => ({
    name: categoryLabels[item.category],
    value: item.total,
    color: `hsl(var(--chart-${(Object.keys(categoryLabels).indexOf(item.category) % 5) + 1}))`,
  })) || [];

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-medium mb-2" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do desempenho financeiro</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total de Vendas"
              value={formatCurrency(analytics?.totalSales || 0)}
              icon={DollarSign}
              testId="card-total-sales"
            />
            <MetricCard
              title="Recebido"
              value={formatCurrency(analytics?.totalReceived || 0)}
              icon={TrendingUp}
              testId="card-received"
            />
            <MetricCard
              title="A Receber"
              value={formatCurrency(analytics?.totalPending || 0)}
              icon={AlertCircle}
              testId="card-pending"
            />
            <MetricCard
              title="Despesas Totais"
              value={formatCurrency(analytics?.totalExpenses || 0)}
              icon={TrendingDown}
              testId="card-expenses"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-expenses-chart">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : expensesChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa registrada
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-top-debtors">
          <CardHeader>
            <CardTitle>Clientes com Maior Débito</CardTitle>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : topDebtors.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum cliente com débito
              </div>
            ) : (
              <div className="space-y-4">
                {topDebtors.map((debtor) => (
                  <div key={debtor.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {debtor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`text-debtor-${debtor.id}`}>{debtor.name}</p>
                    </div>
                    <div className="font-mono font-medium text-destructive">
                      {formatCurrency(parseFloat(debtor.totalDebt))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-transactions">
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : recentSales.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma venda registrada
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-transaction-${sale.id}`}>
                      {sale.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString("pt-BR")} - {sale.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-medium">
                      {formatCurrency(parseFloat(sale.amount))}
                    </div>
                    <StatusBadge status={sale.paymentStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
