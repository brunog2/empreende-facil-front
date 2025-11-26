import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  Users, 
  Receipt,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  Shield,
  Navigation
} from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar de Navegação */}
      <aside className="w-64 border-r bg-muted/40 p-6 hidden lg:block">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold">Documentação</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <nav className="space-y-2">
              <Button
                variant={activeSection === "visao-geral" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => scrollToSection("visao-geral")}
              >
                Visão Geral
              </Button>
              <Button
                variant={activeSection === "modulos" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => scrollToSection("modulos")}
              >
                Módulos Principais
              </Button>
              <Button
                variant={activeSection === "funcionalidades" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => scrollToSection("funcionalidades")}
              >
                Funcionalidades
              </Button>
              <Button
                variant={activeSection === "dicas" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => scrollToSection("dicas")}
              >
                Dicas e Boas Práticas
              </Button>
              <Button
                variant={activeSection === "navegacao" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => scrollToSection("navegacao")}
              >
                Navegação
              </Button>
            </nav>
          </ScrollArea>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Cabeçalho */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-bold">Documentação da Plataforma</h1>
            <p className="text-xl text-muted-foreground">Gestão Pro - Guia Completo de Uso</p>
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Visão Geral */}
          <section id="visao-geral" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Visão Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A <strong>Gestão Pro</strong> é uma plataforma completa para gerenciamento de negócios, 
                  permitindo controle de produtos, vendas, despesas, clientes e categorias em um único lugar.
                </p>
                <p className="text-muted-foreground">
                  Com uma interface intuitiva e funcionalidades poderosas, você pode gerenciar todos os 
                  aspectos do seu negócio de forma eficiente e organizada.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Módulos Principais */}
          <section id="modulos" className="scroll-mt-6">
            <h2 className="text-3xl font-bold mb-6">Módulos Principais</h2>
            
            <div className="space-y-6">
              {/* Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    1. Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    O painel principal oferece uma visão geral do seu negócio:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Faturamento do Mês</strong>: Total de vendas realizadas no mês atual</li>
                    <li><strong>Despesas do Mês</strong>: Total de gastos no período</li>
                    <li><strong>Lucro</strong>: Diferença entre receitas e despesas</li>
                    <li><strong>Alertas de Estoque</strong>: Produtos com estoque abaixo do mínimo</li>
                    <li><strong>Gráficos</strong>: Visualização de vendas dos últimos 7 dias</li>
                    <li><strong>Produtos Mais Vendidos</strong>: Top 5 produtos por receita</li>
                    <li><strong>Últimas Vendas</strong>: As 5 vendas mais recentes</li>
                    <li><strong>Ação Rápida</strong>: Botão para criar nova venda diretamente</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Vendas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    2. Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Módulo completo para gerenciamento de vendas:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Criar Venda</strong>: Registre novas vendas com múltiplos produtos</li>
                    <li><strong>Editar Venda</strong>: Atualize informações de vendas existentes</li>
                    <li><strong>Excluir Venda</strong>: Remova vendas (o estoque será restaurado automaticamente)</li>
                    <li><strong>Cadastro Rápido de Cliente</strong>: Crie clientes diretamente durante a venda</li>
                    <li><strong>Histórico Completo</strong>: Visualize todas as vendas realizadas</li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold mb-2">Como criar uma venda:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Clique em "Nova Venda"</li>
                      <li>Selecione um cliente (opcional) ou cadastre um novo</li>
                      <li>Escolha a forma de pagamento</li>
                      <li>Adicione produtos à venda</li>
                      <li>Ajuste quantidades e preços se necessário</li>
                      <li>Adicione observações (opcional)</li>
                      <li>Finalize a venda</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Produtos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    3. Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Gerenciamento completo de estoque:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Cadastrar Produto</strong>: Adicione novos produtos ao catálogo</li>
                    <li><strong>Editar Produto</strong>: Atualize informações de produtos existentes</li>
                    <li><strong>Excluir Produto</strong>: Remova produtos do sistema</li>
                    <li><strong>Categorias</strong>: Organize produtos por categorias</li>
                    <li><strong>Controle de Estoque</strong>: Monitore quantidades e estoque mínimo</li>
                    <li><strong>Alertas</strong>: Receba avisos quando o estoque estiver baixo</li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold mb-2">Campos do Produto:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Nome (obrigatório)</li>
                      <li>Categoria (pode criar nova categoria sem sair da tela)</li>
                      <li>Descrição</li>
                      <li>Preço de Custo (obrigatório)</li>
                      <li>Preço de Venda (obrigatório, deve ser maior ou igual ao custo)</li>
                      <li>Quantidade em Estoque (obrigatório)</li>
                      <li>Estoque Mínimo (opcional)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5" />
                    4. Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Organize seus produtos por categorias:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Criar Categoria</strong>: Adicione novas categorias</li>
                    <li><strong>Editar Categoria</strong>: Atualize informações</li>
                    <li><strong>Excluir Categoria</strong>: Remova categorias não utilizadas</li>
                    <li><strong>Busca</strong>: Encontre categorias rapidamente</li>
                    <li><strong>Cadastro Rápido</strong>: Crie categorias diretamente no cadastro de produtos</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    5. Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Gerencie sua base de clientes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Cadastrar Cliente</strong>: Adicione novos clientes</li>
                    <li><strong>Editar Cliente</strong>: Atualize informações</li>
                    <li><strong>Excluir Cliente</strong>: Remova clientes</li>
                    <li><strong>Informações</strong>: Nome, email, telefone, endereço e observações</li>
                    <li><strong>Cadastro Rápido</strong>: Crie clientes durante a venda</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    6. Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Controle completo de gastos:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Criar Despesa</strong>: Registre novos gastos</li>
                    <li><strong>Editar Despesa</strong>: Atualize informações</li>
                    <li><strong>Excluir Despesa</strong>: Remova despesas</li>
                    <li><strong>Recorrências</strong>: Configure despesas recorrentes
                      <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                        <li>Diária</li>
                        <li>Semanal</li>
                        <li>Quinzenal</li>
                        <li>Mensal</li>
                        <li>Trimestral</li>
                        <li>Semestral</li>
                        <li>Anual</li>
                      </ul>
                    </li>
                    <li><strong>Filtros</strong>: Filtre por categoria e tipo (recorrente/avulsa)</li>
                    <li><strong>Categorias</strong>: Organize despesas por categorias</li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold mb-2">Como criar uma despesa recorrente:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Clique em "Nova Despesa"</li>
                      <li>Preencha descrição, valor, categoria e data</li>
                      <li>Ative o switch "Despesa recorrente"</li>
                      <li>Selecione o período de recorrência</li>
                      <li>Salve</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Funcionalidades */}
          <section id="funcionalidades" className="scroll-mt-6">
            <h2 className="text-3xl font-bold mb-6">Funcionalidades</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Máscaras Monetárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Todos os campos de preço utilizam máscara monetária brasileira (R$), 
                    facilitando a entrada de valores.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Validações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Todos os formulários possuem validação completa</li>
                    <li>Mensagens de erro em português</li>
                    <li>Validação em tempo real</li>
                    <li>Prevenção de erros comuns</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Estados de Loading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Indicadores visuais durante carregamento</li>
                    <li>Botões desabilitados durante processamento</li>
                    <li>Feedback claro para o usuário</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Tratamento de Erros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Todas as mensagens de erro em português</li>
                    <li>Feedback claro sobre o que aconteceu</li>
                    <li>Sugestões de correção quando aplicável</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Dicas e Boas Práticas */}
          <section id="dicas" className="scroll-mt-6">
            <h2 className="text-3xl font-bold mb-6">Dicas e Boas Práticas</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>1. Categorias</strong>: Use categorias para organizar seus produtos. 
                    Isso facilita a busca e o gerenciamento.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>2. Estoque Mínimo</strong>: Configure o estoque mínimo para receber 
                    alertas antes de ficar sem produtos.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>3. Clientes</strong>: Mantenha a base de clientes atualizada para 
                    facilitar as vendas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>1. Cadastro Rápido</strong>: Use o cadastro rápido de clientes 
                    durante a venda para não perder tempo.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>2. Observações</strong>: Adicione observações importantes sobre 
                    a venda para referência futura.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>3. Histórico</strong>: Consulte o histórico de vendas regularmente 
                    para identificar padrões.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>1. Recorrências</strong>: Configure despesas fixas como recorrentes 
                    para economizar tempo.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>2. Filtros</strong>: Use os filtros para analisar despesas por 
                    categoria ou tipo.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>3. Categorias</strong>: Organize despesas por categorias para 
                    melhor controle financeiro.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>1. Monitoramento</strong>: Acompanhe o dashboard diariamente para 
                    ter visão geral do negócio.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>2. Gráficos</strong>: Use os gráficos para identificar tendências 
                    de vendas.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>3. Alertas</strong>: Fique atento aos alertas de estoque baixo.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>1. Senha</strong>: Use uma senha forte e não compartilhe suas credenciais.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>2. Logout</strong>: Sempre faça logout ao terminar de usar a plataforma.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>3. Backup</strong>: Exporte seus dados regularmente (funcionalidade futura).
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Navegação */}
          <section id="navegacao" className="scroll-mt-6">
            <h2 className="text-3xl font-bold mb-6">Navegação</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Menu Lateral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    O menu lateral permite acesso rápido a todos os módulos:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Dashboard</strong>: Visão geral</li>
                    <li><strong>Vendas</strong>: Gerenciamento de vendas</li>
                    <li><strong>Produtos</strong>: Controle de estoque</li>
                    <li><strong>Categorias</strong>: Organização de categorias</li>
                    <li><strong>Clientes</strong>: Base de clientes</li>
                    <li><strong>Despesas</strong>: Controle de gastos</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No rodapé do menu lateral, você pode ver:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Seu nome completo</li>
                    <li>Nome do negócio (se cadastrado)</li>
                    <li>Email de login</li>
                    <li>Botão de sair (com confirmação)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Suporte */}
          <section className="scroll-mt-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para dúvidas ou problemas:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Consulte esta documentação</li>
                  <li>Verifique as mensagens de erro (elas estão em português)</li>
                  <li>Entre em contato através dos canais de suporte</li>
                </ol>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}


