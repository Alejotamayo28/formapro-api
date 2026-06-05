import {
  PaymentCurrency,
  PaymentFilters,
  PaymentListParams,
  PaymentStatus,
  TimelineGranularity,
} from '../../entities/Payment';

export const SUPPORTED_CURRENCIES: PaymentCurrency[] = ['COP', 'USD'];
export const SUPPORTED_STATUSES: PaymentStatus[] = ['completed', 'failed', 'refunded'];

export function buildFilters(input: PaymentFilters = {}): PaymentFilters {
  return {
    status: normalizeStatus(input.status),
    currency: normalizeCurrency(input.currency),
    course: normalizeText(input.course),
  };
}

export function buildListParams(input: PaymentListParams = {}): PaymentListParams {
  return {
    ...buildFilters(input),
    page: input.page,
    pageSize: input.pageSize,
    sortBy: input.sortBy,
    sortOrder: input.sortOrder,
  };
}

export function normalizeCurrency(value?: PaymentCurrency): PaymentCurrency | undefined {
  if (!value) return undefined;
  const currency = String(value).trim().toUpperCase();
  if (currency === 'COP' || currency === 'USD') return currency;
  return undefined;
}

export function normalizeStatus(value?: PaymentStatus): PaymentStatus | undefined {
  if (!value) return undefined;
  const status = String(value).trim().toLowerCase();
  if (status === 'completed' || status === 'failed' || status === 'refunded') return status;
  return undefined;
}

export function normalizeGranularity(value?: TimelineGranularity): TimelineGranularity {
  if (value === 'week' || value === 'month') return value;
  return 'day';
}

function normalizeText(value?: string): string | undefined {
  if (!value) return undefined;
  const text = value.trim();
  return text || undefined;
}
