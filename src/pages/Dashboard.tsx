import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSales,
  useMonthlySalesTotal,
  useTopProducts,
} from "@/hooks/use-sales";
import { useMonthlyExpensesTotal } from "@/hooks/use-expenses";
import { useLowStockProducts, useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  Plus,
  Package,
  BarChart3,
  LineChart as LineChartIcon,
  Filter,
  X,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardShimmer } from "@/components/shimmer/DashboardShimmer";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(1); // Primeiro dia do mês
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNumber = now.getMonth() + 1;

  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: monthlySalesTotal = 0, isLoading: salesTotalLoading } =
    useMonthlySalesTotal(currentYear, currentMonthNumber);
  const { data: monthlyExpensesTotal = 0, isLoading: expensesTotalLoading } =
    useMonthlyExpensesTotal(currentYear, currentMonthNumber);
  const { data: allTopProducts = [], isLoading: topProductsLoading } =
    useTopProducts(5);

  // Filtrar vendas baseado nos filtros
  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Filtro de período
    if (startDate || endDate) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        // Normalizar a data da venda para comparar apenas a data (sem horas)
        const saleDateOnly = new Date(
          saleDate.getFullYear(),
          saleDate.getMonth(),
          saleDate.getDate()
        );

        if (startDate) {
          // Parse da data no formato YYYY-MM-DD como horário local
          const [startYear, startMonth, startDay] = startDate
            .split("-")
            .map(Number);
          const start = new Date(startYear, startMonth - 1, startDay);
          if (saleDateOnly < start) return false;
        }

        if (endDate) {
          // Parse da data no formato YYYY-MM-DD como horário local
          const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
          const end = new Date(endYear, endMonth - 1, endDay);
          // Comparar apenas a parte da data
          if (saleDateOnly > end) return false;
        }

        return true;
      });
    }

    // Filtro de categoria
    if (categoryFilter && categoryFilter !== "all") {
      if (categoryFilter === "sem_categoria") {
        // Filtrar vendas que têm produtos sem categoria
        filtered = filtered.filter((sale) => {
          return sale.saleItems.some((item) => {
            const product = products.find((p) => p.id === item.productId);
            return !product?.category || product.category === null;
          });
        });
      } else {
        filtered = filtered.filter((sale) => {
          return sale.saleItems.some((item) => {
            const product = products.find((p) => p.id === item.productId);
            return product?.category === categoryFilter;
          });
        });
      }
    }

    // Filtro de produto
    if (productFilter && productFilter !== "all") {
      filtered = filtered.filter((sale) => {
        return sale.saleItems.some((item) => item.productId === productFilter);
      });
    }

    return filtered;
  }, [sales, startDate, endDate, categoryFilter, productFilter, products]);

  const hasActiveFilters =
    startDate ||
    endDate ||
    (categoryFilter && categoryFilter !== "all") ||
    (productFilter && productFilter !== "all");

  // Filtrar top products baseado nos filtros
  const topProducts = useMemo(() => {
    if (!hasActiveFilters) return allTopProducts;

    // Calcular top products das vendas filtradas
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    filteredSales.forEach((sale) => {
      sale.saleItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;

        const existing = productMap.get(item.productId) || {
          name: product.name,
          quantity: 0,
          revenue: 0,
        };

        existing.quantity += item.quantity;
        existing.revenue += Number(item.subtotal);
        productMap.set(item.productId, existing);
      });
    });

    return Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalQuantity: data.quantity,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [allTopProducts, filteredSales, products, hasActiveFilters]);
  const { data: lowStockProducts = [], isLoading: lowStockLoading } =
    useLowStockProducts();

  const isLoading =
    salesLoading ||
    salesTotalLoading ||
    expensesTotalLoading ||
    topProductsLoading ||
    lowStockLoading;

  // Calcular totais baseados nos filtros
  const filteredSalesTotal = useMemo(() => {
    return filteredSales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0
    );
  }, [filteredSales]);

  const filteredExpensesTotal = useMemo(() => {
    // Filtrar despesas pelo período
    // Nota: despesas não têm filtro de categoria/produto, apenas período
    return monthlyExpensesTotal; // Por enquanto mantém o total do mês, pode ser melhorado depois
  }, [monthlyExpensesTotal, startDate, endDate]);

  // Calcular lucro real (vendas - despesas - custo dos produtos vendidos)
  const productCosts = useMemo(() => {
    return filteredSales.reduce((sum, sale) => {
      return (
        sum +
        sale.saleItems.reduce((itemSum, item) => {
          const product = products.find((p) => p.id === item.productId);
          const cost = product?.costPrice || 0;
          return itemSum + cost * item.quantity;
        }, 0)
      );
    }, 0);
  }, [filteredSales, products]);

  const profit = filteredSalesTotal - filteredExpensesTotal - productCosts;
  const recentSales = filteredSales.slice(0, 5);

  const clearFilters = () => {
    const date = new Date();
    date.setDate(1);
    setStartDate(date.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setCategoryFilter(null);
    setProductFilter(null);
  };

  // Preparar dados para gráfico de vendas dos últimos 7 dias (ou período filtrado)
  const salesChartData = useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    // Se não há filtro de data, usar últimos 7 dias
    if (!startDate && !endDate) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      return last7Days.map((date) => {
        const daySales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.saleDate);
          return saleDate.toDateString() === date.toDateString();
        });
        const total = daySales.reduce(
          (sum, sale) => sum + Number(sale.totalAmount),
          0
        );
        return {
          date: format(date, "dd/MM"),
          total,
          count: daySales.length,
        };
      });
    }

    // Se há filtro de data, usar o período filtrado
    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days.map((date) => {
      const daySales = filteredSales.filter((sale) => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.toDateString() === date.toDateString();
      });
      const total = daySales.reduce(
        (sum, sale) => sum + Number(sale.totalAmount),
        0
      );
      return {
        date: format(date, "dd/MM"),
        total,
        count: daySales.length,
      };
    });
  }, [filteredSales, startDate, endDate]);

  // Preparar dados para gráfico de pizza de categorias mais vendidas
  const topCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredSales.forEach((sale) => {
      sale.saleItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const category = product?.category || "Sem categoria";
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + Number(item.subtotal));
      });
    });

    const categoryData: Array<{ name: string; value: number }> = [];
    categoryMap.forEach((value, name) => {
      categoryData.push({ name, value });
    });

    // Ordenar por valor e pegar top 6
    categoryData.sort((a, b) => b.value - a.value);
    return categoryData.slice(0, 6);
  }, [filteredSales, products]);

  if (isLoading) {
    return <DashboardShimmer />;
  }

  return (
    <>
      <div
        className="space-y-4 md:space-y-6 p-4 md:p-6 w-full"
        style={{ maxWidth: "100vw", boxSizing: "border-box" }}
      >
        {/* Destaque para Vendas */}
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Registre uma Nova Venda
                </h2>
                <p className="text-muted-foreground mb-4">
                  Crie uma venda rapidamente e aumente seu faturamento
                </p>
                <Button
                  onClick={() => navigate("/vendas?novaVenda=true")}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Venda
                </Button>
              </div>
              <ShoppingCart className="h-24 w-24 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visão geral do seu negócio
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {
                    [
                      startDate,
                      endDate,
                      categoryFilter && categoryFilter !== "all",
                      productFilter && productFilter !== "all",
                    ].filter(Boolean).length
                  }
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => navigate("/vendas?novaVenda=true")}
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <SearchableSelect
                    value={categoryFilter}
                    onChange={(value) => setCategoryFilter(value)}
                    options={[
                      { value: "all", label: "Todas" },
                      { value: "sem_categoria", label: "Sem categoria" },
                      ...categories.map((cat) => ({
                        value: cat.name,
                        label: cat.name,
                      })),
                    ]}
                    placeholder="Todas as categorias"
                    searchPlaceholder="Buscar categoria..."
                    emptyMessage="Nenhuma categoria encontrada."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <SearchableSelect
                    value={productFilter}
                    onChange={(value) => setProductFilter(value)}
                    options={[
                      { value: "all", label: "Todos" },
                      ...products.map((prod) => ({
                        value: prod.id,
                        label: prod.name,
                      })),
                    ]}
                    placeholder="Todos os produtos"
                    searchPlaceholder="Buscar produto..."
                    emptyMessage="Nenhum produto encontrado."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-lg border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Faturamento do Mês
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(filteredSalesTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredSales.length} venda(s){" "}
                {hasActiveFilters ? "filtrada(s)" : "no total"}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Despesas do Mês
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(filteredExpensesTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gastos totais{" "}
                {hasActiveFilters ? "do período filtrado" : "do período"}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lucro</CardTitle>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  profit >= 0 ? "text-green-600" : "text-destructive"
                }`}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(profit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas - Custo dos Produtos
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas de Estoque
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos sem estoque
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
                  <CardDescription>Gráfico de vendas diárias</CardDescription>
                </div>
                <Tabs
                  value={chartType}
                  onValueChange={(v) => setChartType(v as "bar" | "line")}
                >
                  <TabsList>
                    <TabsTrigger value="bar" className="h-8">
                      <BarChart3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="line" className="h-8">
                      <LineChartIcon className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === "bar" ? (
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value),
                        "Total",
                      ]}
                    />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value),
                        "Total",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Top 5 produtos por receita</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhum produto vendido ainda
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.totalQuantity} unidade(s) vendida(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Vendas</CardTitle>
              <CardDescription>As 5 vendas mais recentes</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {recentSales.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground px-6">
                  Nenhuma venda registrada ainda
                </div>
              ) : (
                <div className="w-full overflow-x-auto px-6 sm:px-0">
                  <Table className="min-w-[400px] w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {format(
                              new Date(sale.saleDate),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </TableCell>
                          <TableCell>
                            {sale.customer?.name || "Cliente não informado"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(sale.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorias Mais Vendidas</CardTitle>
              <CardDescription>Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma venda registrada ainda
                </div>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(value),
                          "Total",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {topCategories.map((category, index) => (
                      <div
                        key={category.name}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="truncate" title={category.name}>
                          {category.name}
                        </span>
                        <span className="text-muted-foreground">
                          (
                          {(
                            (category.value /
                              topCategories.reduce(
                                (sum, c) => sum + c.value,
                                0
                              )) *
                            100
                          ).toFixed(0)}
                          %)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
              <CardDescription>
                Produtos que precisam de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Todos os produtos estão com estoque adequado
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Estoque: {product.stockQuantity}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                      >
                        Baixo
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/produtos")}
                    >
                      Ver todos ({lowStockProducts.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {lowStockProducts.length > 0 && (
          <Card className="border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Você tem {lowStockProducts.length} produto(s) com estoque abaixo
                do mínimo.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/produtos?estoqueBaixo=true")}
                className="w-full"
              >
                <Package className="mr-2 h-4 w-4" />
                Ver Produtos com Estoque Baixo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
