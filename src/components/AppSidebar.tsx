import { useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Receipt, Users, LogOut, Tags, User, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Categorias", url: "/categorias", icon: Tags },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Despesas", url: "/despesas", icon: Receipt },
  { title: "Documentação", url: "/documentacao", icon: BookOpen },
  { title: "Meu Perfil", url: "/perfil", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const collapsed = state === "collapsed";
  const { data: user } = useCurrentUser();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    // Limpar todo o cache do React Query antes de fazer logout
    queryClient.clear();
    queryClient.removeQueries();
    
    // Limpar apenas tokens do localStorage (não limpar tudo)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    navigate("/auth");
    toast.success("Logout realizado com sucesso");
    setLogoutDialogOpen(false);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Informações do usuário no topo */}
        {user && (
          <SidebarGroup className="border-b">
            <SidebarMenuButton
              asChild
              className={`w-full hover:bg-sidebar-accent/50 focus:bg-sidebar-accent/50 rounded-none border-none h-auto p-4 ${collapsed ? 'justify-center' : 'justify-start'}`}
            >
              <NavLink to="/perfil" className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    {user.businessName && (
                      <p className="text-xs text-muted-foreground truncate">{user.businessName}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <span className={`font-display text-lg font-bold text-sidebar-primary transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              Gestão Pro
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={`transition-colors ${
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                          : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarFooter className="border-t">
          <div className={`p-2 ${collapsed ? 'flex justify-center' : ''}`}>
            <SidebarMenuButton
              onClick={() => setLogoutDialogOpen(true)}
              className={`w-full hover:bg-destructive/10 hover:text-destructive text-destructive focus:bg-destructive/10 focus:text-destructive ${collapsed ? 'justify-center' : 'justify-start'}`}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      </SidebarContent>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair da aplicação? Você precisará fazer login novamente para acessar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
