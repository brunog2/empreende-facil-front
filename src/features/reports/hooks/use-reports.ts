import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../api/reports-api";
import type { Backup, ReportPeriod } from "../types/reports";

export function useReportSummary(period: ReportPeriod) {
  return useQuery({
    queryKey: ["reports", "summary", period],
    queryFn: () => reportsApi.getSummary(period),
  });
}

export function useAdvancedReport(period: ReportPeriod, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "advanced", period],
    queryFn: () => reportsApi.getAdvanced(period),
    enabled,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format, period }: { format: "xlsx" | "pdf"; period: ReportPeriod }) =>
      reportsApi.exportReport(format, period),
  });
}

export function useBackups(enabled: boolean) {
  return useQuery({
    queryKey: ["backups"],
    queryFn: reportsApi.listBackups,
    enabled,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.createBackup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backups"] }),
  });
}

export function useDownloadBackup() {
  return useMutation({ mutationFn: (backup: Backup) => reportsApi.downloadBackup(backup) });
}
