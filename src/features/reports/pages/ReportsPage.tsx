import { useMemo, useState } from "react";
import {
  Archive,
  BarChart3,
  Download,
  FileDown,
  PackageSearch,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useSubscription } from "@/features/subscriptions/context/SubscriptionProvider";
import {
  formatDate,
  formatMoney,
} from "@/features/subscriptions/utils/subscription-utils";
import { getErrorMessage } from "@/lib/api";
import { FeatureUpgradeCard } from "../components/FeatureUpgradeCard";
import {
  useAdvancedReport,
  useBackups,
  useCreateBackup,
  useDownloadBackup,
  useExportReport,
  useReportSummary,
} from "../hooks/use-reports";
import type { ReportPeriod } from "../types/reports";

function defaultPeriod(): ReportPeriod {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

const compactMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

export default function ReportsPage() {
  const [period, setPeriod] = useState(defaultPeriod);
  const { canAccessFeature } = useSubscription();
  const canUseAdvanced = canAccessFeature("advancedReports");
  const canExport = canAccessFeature("dataExport");
  const canBackup = canAccessFeature("automaticBackup");
  const summary = useReportSummary(period);
  const advanced = useAdvancedReport(period, canUseAdvanced);
  const exportReport = useExportReport();
  const backups = useBackups(canBackup);
  const createBackup = useCreateBackup();
  const downloadBackup = useDownloadBackup();

  const monthlyData = useMemo(
    () =>
      advanced.data?.monthlyEvolution.map((item) => ({
        ...item,
        faturamento: Number(item.revenue),
        despesas: Number(item.expenses),
        cmv: Number(item.costOfGoodsSold),
        resultado: Number(item.operatingResult),
      })) ?? [],
    [advanced.data],
  );
  const topProducts = useMemo(
    () =>
      advanced.data?.topProducts.map((item) => ({
        ...item,
        receita: Number(item.revenue),
      })) ?? [],
    [advanced.data],
  );

  const runExport = async (format: "xlsx" | "pdf") => {
    try {
      await exportReport.mutateAsync({ format, period });
      toast.success(`Relatório ${format === "xlsx" ? "Excel" : "PDF"} gerado.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const runBackup = async () => {
    try {
      await createBackup.mutateAsync();
      toast.success("Backup gerado e armazenado com segurança.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const summaryCards = summary.data
    ? [
        {
          label: "Faturamento",
          value: formatMoney(summary.data.summary.revenue),
          icon: TrendingUp,
        },
        {
          label: "Despesas",
          value: formatMoney(summary.data.summary.expenses),
          icon: Receipt,
        },
        {
          label: "CMV",
          value: formatMoney(summary.data.summary.costOfGoodsSold),
          icon: PackageSearch,
        },
        {
          label: "Resultado operacional estimado",
          value: formatMoney(summary.data.summary.operatingResult),
          icon: BarChart3,
        },
        {
          label: "Vendas",
          value: String(summary.data.summary.salesCount),
          icon: PackageSearch,
        },
        {
          label: "Clientes",
          value: String(summary.data.summary.customers),
          icon: Users,
        },
        {
          label: "Ticket médio",
          value: formatMoney(summary.data.summary.averageTicket),
          icon: TrendingUp,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Inteligência do negócio
          </p>
          <h1 className="font-display text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Analise resultados reais e proteja os dados da sua loja.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="report-start">De</Label>
            <Input
              id="report-start"
              type="date"
              value={period.startDate}
              onChange={(event) =>
                setPeriod((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-end">Até</Label>
            <Input
              id="report-end"
              type="date"
              value={period.endDate}
              onChange={(event) =>
                setPeriod((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      {summary.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : summary.isError ? (
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            Não foi possível carregar o relatório deste período.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold">{item.value}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Análises avançadas
          </h2>
          <p className="text-sm text-muted-foreground">
            Evolução financeira e desempenho de produtos.
          </p>
        </div>
        {!canUseAdvanced ? (
          <FeatureUpgradeCard
            title="Relatórios avançados não estão no seu plano"
            description="Faça upgrade para acompanhar tendências mensais, produtos líderes e crescimento de clientes."
          />
        ) : advanced.isLoading ? (
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução financeira</CardTitle>
                <CardDescription>
                  Faturamento, despesas, CMV e resultado operacional estimado
                  por mês.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        compactMoney.format(Number(value))
                      }
                      width={72}
                    />
                    <Tooltip
                      formatter={(value: number) => formatMoney(String(value))}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="faturamento"
                      name="Faturamento"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      name="Despesas"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cmv"
                      name="CMV"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="resultado"
                      name="Resultado operacional estimado"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Produtos com maior receita</CardTitle>
                <CardDescription>
                  Itens que mais contribuíram no período.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        compactMoney.format(Number(value))
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatMoney(String(value))}
                    />
                    <Bar
                      dataKey="receita"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Exportação Excel/PDF
          </h2>
          <p className="text-sm text-muted-foreground">
            Leve vendas, produtos, clientes e despesas do período.
          </p>
        </div>
        {!canExport ? (
          <FeatureUpgradeCard
            title="Exportação não incluída"
            description="O plano Pro permite baixar relatórios em Excel e PDF."
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Relatório consolidado</p>
                <p className="text-sm text-muted-foreground">
                  Os arquivos são gerados no servidor a partir dos seus dados.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={exportReport.isPending}
                  onClick={() => runExport("xlsx")}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  disabled={exportReport.isPending}
                  onClick={() => runExport("pdf")}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Backup automático</h2>
          <p className="text-sm text-muted-foreground">
            Cópias diárias dos dados da loja, com retenção segura.
          </p>
        </div>
        {!canBackup ? (
          <FeatureUpgradeCard
            title="Backup automático não incluído"
            description="Faça upgrade para gerar cópias compactadas e recuperar os dados da sua operação."
          />
        ) : (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Backups da loja
                </CardTitle>
                <CardDescription>
                  O sistema cria um backup diário às 03h. Você também pode gerar
                  um agora.
                </CardDescription>
              </div>
              <Button disabled={createBackup.isPending} onClick={runBackup}>
                {createBackup.isPending ? "Gerando..." : "Gerar backup agora"}
              </Button>
            </CardHeader>
            <CardContent>
              {backups.isLoading ? (
                <div className="h-24 animate-pulse rounded bg-muted" />
              ) : backups.data?.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead className="text-right">Arquivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.data.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell>{formatDate(backup.createdAt)}</TableCell>
                          <TableCell>
                            {backup.triggeredBy === "automatic"
                              ? "Automático"
                              : "Manual"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                backup.status === "completed"
                                  ? "default"
                                  : backup.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {backup.status === "completed"
                                ? "Concluído"
                                : backup.status === "failed"
                                  ? "Falhou"
                                  : "Processando"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(Number(backup.sizeBytes) / 1024).toLocaleString(
                              "pt-BR",
                              { maximumFractionDigits: 1 },
                            )}{" "}
                            KB
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={
                                backup.status !== "completed" ||
                                downloadBackup.isPending
                              }
                              onClick={() => downloadBackup.mutate(backup)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Baixar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <Archive className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  <p>Nenhum backup gerado ainda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
