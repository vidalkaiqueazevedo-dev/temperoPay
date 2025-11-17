import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Vendas from "@/pages/vendas";
import Clientes from "@/pages/clientes";
import Despesas from "@/pages/despesas";
import Fornecedores from "@/pages/fornecedores";
import Relatorios from "@/pages/relatorios";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { PrivateRoute } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/vendas" component={() => <PrivateRoute component={Vendas} />} />
      <Route path="/clientes" component={() => <PrivateRoute component={Clientes} />} />
      <Route path="/despesas" component={() => <PrivateRoute component={Despesas} />} />
      <Route path="/fornecedores" component={() => <PrivateRoute component={Fornecedores} />} />
      <Route path="/relatorios" component={() => <PrivateRoute component={Relatorios} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const [location] = useLocation();
  const isLogin = location === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            {!isLogin && <AppSidebar />}
            <div className="flex flex-col flex-1 overflow-hidden">
              {!isLogin && (
              <header className="flex items-center justify-between p-4 border-b bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              )}
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
