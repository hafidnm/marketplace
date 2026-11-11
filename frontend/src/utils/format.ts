import type { ConditionType, StatusType } from '../types';

/**
 * Format number to Indonesian Rupiah (e.g. 750000 -> Rp 750.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Friendly label for condition types
 */
export const CONDITION_LABELS: Record<ConditionType, string> = {
  NEW: 'Baru',
  LIKE_NEW: 'Seperti Baru',
  GOOD: 'Bagus',
  FAIR: 'Layak Pakai',
};

/**
 * Friendly label for status types
 */
export const STATUS_LABELS: Record<StatusType, string> = {
  AVAILABLE: 'Tersedia',
  SOLD: 'Terjual',
};

/**
 * Format ISO date string to readable Indonesian date
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
