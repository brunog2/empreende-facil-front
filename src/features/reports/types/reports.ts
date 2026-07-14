export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface ReportSummary {
  period: ReportPeriod;
  summary: {
    revenue: string;
    expenses: string;
    costOfGoodsSold: string;
    operatingResult: string;
    profit: string;
    salesCount: number;
    averageTicket: string;
    products: number;
    customers: number;
    lowStockProducts: number;
    stockValue: string;
  };
}

export interface AdvancedReport {
  period: ReportPeriod;
  monthlyEvolution: Array<{
    month: string;
    revenue: string;
    expenses: string;
    costOfGoodsSold: string;
    operatingResult: string;
    profit: string;
  }>;
  topProducts: Array<{ name: string; revenue: string; quantity: number }>;
  salesByPaymentMethod: Array<{ name: string; total: string; count: number }>;
  expensesByCategory: Array<{ name: string; total: string }>;
  customerGrowth: Array<{ month: string; newCustomers: number }>;
}

export type BackupStatus = "processing" | "completed" | "failed";
export type BackupTrigger = "automatic" | "manual";

export interface Backup {
  id: string;
  status: BackupStatus;
  triggeredBy: BackupTrigger;
  fileName: string;
  contentType: string;
  sizeBytes: string;
  checksum: string | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}
