import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionRoute } from "@/components/PermissionRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
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
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptionsPage from "./features/subscriptions/pages/admin/AdminSubscriptionsPage";
import AdminPlansPage from "./features/subscriptions/pages/admin/AdminPlansPage";
import AdminPaymentsPage from "./features/subscriptions/pages/admin/AdminPaymentsPage";
import PlansPage from "./features/subscriptions/pages/PlansPage";
import SubscriptionPage from "./features/subscriptions/pages/SubscriptionPage";
import { SubscriptionProvider } from "./features/subscriptions/context/SubscriptionProvider";
import { SubscriptionRequired } from "./features/subscriptions/components/SubscriptionRequired";
import { FeatureRequired } from "./features/subscriptions/components/FeatureRequired";
import { SubscriptionNotices } from "./features/subscriptions/components/SubscriptionNotices";
import { PlanFeature } from "./features/subscriptions/types/subscription";
import { UserPermission } from "./types/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados ficam frescos por 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos - cache mantido por 10 minutos após último uso
      refetchOnWindowFocus: false,
    },
  },
});

function HeaderLogo({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(admin ? "/admin" : "/")}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <span className="font-display text-lg font-bold text-primary">
        {admin ? "Gestão Pro Admin" : "Gestão Pro"}
      </span>
    </button>
  );
}

function BusinessRoute({
  permission,
  feature,
  children,
}: {
  permission: UserPermission;
  feature: PlanFeature;
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute permission={permission}>
      <SubscriptionRequired>
        <FeatureRequired feature={feature}>{children}</FeatureRequired>
      </SubscriptionRequired>
    </PermissionRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AdminSidebar />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
                        <SidebarTrigger />
                        <HeaderLogo admin />
                      </header>
                      <main className="min-w-0 flex-1 overflow-auto bg-muted/20">
                        <Routes>
                          <Route path="" element={<AdminDashboard />} />
                          <Route
                            path="usuarios"
                            element={<AdminUsers />}
                          />
                          <Route path="assinaturas" element={<AdminSubscriptionsPage />} />
                          <Route path="planos" element={<AdminPlansPage />} />
                          <Route path="pagamentos" element={<AdminPaymentsPage />} />
                          <Route
                            path="*"
                            element={<Navigate to="/admin" replace />}
                          />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute requiredRole="customer">
                <SubscriptionProvider>
                  <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
                        <SidebarTrigger />
                        <HeaderLogo />
                      </header>
                      <main className="min-w-0 flex-1 overflow-auto">
                        <SubscriptionNotices />
                        <Routes>
                          <Route path="/" element={<BusinessRoute permission="dashboard" feature="dashboard"><Dashboard /></BusinessRoute>} />
                          <Route
                            path="/produtos"
                            element={
                              <BusinessRoute permission="products" feature="products">
                                <Products />
                              </BusinessRoute>
                            }
                          />
                          <Route
                            path="/produtos/:id"
                            element={
                              <BusinessRoute permission="products" feature="products">
                                <ProductDetails />
                              </BusinessRoute>
                            }
                          />
                          <Route
                            path="/vendas"
                            element={
                              <BusinessRoute permission="sales" feature="sales">
                                <Sales />
                              </BusinessRoute>
                            }
                          />
                          <Route
                            path="/despesas"
                            element={
                              <BusinessRoute permission="expenses" feature="expenses">
                                <Expenses />
                              </BusinessRoute>
                            }
                          />
                          <Route
                            path="/clientes"
                            element={
                              <BusinessRoute permission="customers" feature="customers">
                                <Customers />
                              </BusinessRoute>
                            }
                          />
                          <Route
                            path="/categorias"
                            element={
                              <BusinessRoute permission="categories" feature="categories">
                                <Categories />
                              </BusinessRoute>
                            }
                          />
                          <Route path="/perfil" element={<Profile />} />
                          <Route path="/assinatura" element={<SubscriptionPage />} />
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
                </SubscriptionProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
