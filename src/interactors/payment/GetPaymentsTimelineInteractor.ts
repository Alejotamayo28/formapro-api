import {
  PaymentCurrency,
  PaymentFilters,
  TimelineChartItem,
  TimelineGranularity,
} from '../../entities/Payment';
import { findAllPayments } from '../../gateway/Payment';
import { getTimelinePeriod } from '../../utils/dates';
import { buildFilters, normalizeGranularity } from './shared';

export interface TimelineInput extends PaymentFilters {
  granularity?: TimelineGranularity;
  currency?: PaymentCurrency;
}

export const GetPaymentsTimelineInteractor = async (
  input: TimelineInput = {}
): Promise<TimelineChartItem[]> => {
  const granularity = normalizeGranularity(input.granularity);
  const payments = await findAllPayments(buildFilters(input));
  const groups = new Map<string, TimelineChartItem>();

  for (const payment of payments) {
    if (payment.estado !== 'completed') continue;

    const period = getTimelinePeriod(payment.fecha, granularity);
    const key = `${period}:${payment.moneda}`;
    const current = groups.get(key) ?? {
      period,
      currency: payment.moneda,
      amount: 0,
      count: 0,
    };

    current.amount += payment.importe;
    current.count += 1;
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.period === right.period) return left.currency.localeCompare(right.currency);
    return left.period.localeCompare(right.period);
  });
};
