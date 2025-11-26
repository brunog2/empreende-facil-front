import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Documentation from "./pages/Documentation";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados ficam frescos por 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos - cache mantido por 10 minutos após último uso
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex flex-1 flex-col">
                      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4">
                        <SidebarTrigger />
                      </header>
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/produtos" element={<Products />} />
                          <Route path="/vendas" element={<Sales />} />
                          <Route path="/despesas" element={<Expenses />} />
                          <Route path="/clientes" element={<Customers />} />
                          <Route path="/categorias" element={<Categories />} />
                          <Route path="/perfil" element={<Profile />} />
                          <Route
                            path="/documentacao"
                            element={<Documentation />}
                          />
                          <Route path="/termos" element={<TermsOfService />} />
                          <Route
                            path="/privacidade"
                            element={<PrivacyPolicy />}
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
