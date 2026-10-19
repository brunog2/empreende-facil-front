import { api } from "@/lib/api";
import type {
  AdvancedReport,
  Backup,
  ReportPeriod,
  ReportSummary,
} from "../types/reports";

function periodParams(period: ReportPeriod) {
  return { startDate: period.startDate, endDate: period.endDate };
}

export const reportsApi = {
  async getSummary(period: ReportPeriod) {
    const response = await api.get<{ data: ReportSummary }>("/reports/summary", {
      params: periodParams(period),
    });
    return response.data.data;
  },

  async getAdvanced(period: ReportPeriod) {
    const response = await api.get<{ data: AdvancedReport }>("/reports/advanced", {
      params: periodParams(period),
    });
    return response.data.data;
  },

  async exportReport(format: "xlsx" | "pdf", period: ReportPeriod) {
    const response = await api.get<Blob>("/reports/export", {
      params: { ...periodParams(period), format },
      responseType: "blob",
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(response.data, `gestao-pro-relatorio-${date}.${format}`);
  },

  async listBackups() {
    const response = await api.get<{ data: Backup[] }>("/backups");
    return response.data.data;
  },

  async createBackup() {
    const response = await api.post<{ data: Backup }>("/backups");
    return response.data.data;
  },

  async downloadBackup(backup: Backup) {
    const response = await api.get<Blob>(`/backups/${backup.id}/download`, {
      responseType: "blob",
    });
    downloadBlob(response.data, backup.fileName);
  },
};

function downloadBlob(content: Blob, fileName: string) {
  const url = URL.createObjectURL(content);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
