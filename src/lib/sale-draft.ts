const STORAGE_KEY = "gestao-pro-sale-draft";

export interface SaleDraftValues {
  customerId?: string | null;
  paymentMethod: string;
  notes?: string | null;
  saleDate: string;
  saleTime: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export interface SaleDraft {
  returnTo: string;
  lineIndex: number;
  values: SaleDraftValues;
  quantityInputs: Record<string, string>;
}

export function saveSaleDraft(draft: SaleDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function readSaleDraft(): SaleDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SaleDraft;
    if (!parsed?.returnTo || !parsed.values) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSaleDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
