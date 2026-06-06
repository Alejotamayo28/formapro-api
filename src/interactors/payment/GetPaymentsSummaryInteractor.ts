import { PoolClient } from 'pg';
import { PaymentCurrency } from '../../entities/Payment';
import { getPaymentsSummary, PaymentFilters } from '../../gateway/Payment';
import { onSession } from '../../gateway/supabase/Basic';

export interface MoneyMetric {
  currency: PaymentCurrency;
  amount: number;
}

export interface PaymentsSummaryResponse {
  total_payments: number;
  total_refunds: number;
  completed_revenue_by_currency: MoneyMetric[];
  average_ticket_by_currency: MoneyMetric[];
}

export const GetPaymentsSummaryInteractor = async (
  paymentFilters?: PaymentFilters
): Promise<PaymentsSummaryResponse> => {
  return onSession(async (poolClient: PoolClient) => {
    const summary = await getPaymentsSummary(poolClient, paymentFilters);

    return {
      total_payments: summary.totalPayments,
      total_refunds: summary.totalRefunds,
      completed_revenue_by_currency: summary.completedRevenueByCurrency,
      average_ticket_by_currency: summary.averageTicketByCurrency,
    };
  });
};
