import { PoolClient } from 'pg';
import { PaymentCurrency } from '../../entities/Payment';
import { findPayments, PaymentFilters } from '../../gateway/Payment';
import { onSession } from '../../gateway/supabase/Basic';

const SUMMARY_LIMIT = 100000;

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
    const response = await findPayments(
      poolClient,
      paymentFilters,
      undefined,
      undefined,
      SUMMARY_LIMIT,
      0
    );

    const payments = response.payments;
    const totalPayments = payments.length;
    const totalRefunds = payments.filter(
      payment => payment.getEstado() === 'refunded'
    ).length;

    const revenueByCurrency = new Map<PaymentCurrency, number>();
    const completedCountByCurrency = new Map<PaymentCurrency, number>();

    for (const payment of payments) {
      if (payment.getEstado() !== 'completed') continue;

      const currency = payment.getMoneda();
      const amount = payment.getImporte();

      revenueByCurrency.set(
        currency,
        (revenueByCurrency.get(currency) ?? 0) + amount
      );

      completedCountByCurrency.set(
        currency,
        (completedCountByCurrency.get(currency) ?? 0) + 1
      );
    }

    const completedRevenueByCurrency: MoneyMetric[] = Array.from(
      revenueByCurrency.entries()
    ).map(([currency, amount]) => ({
      currency,
      amount,
    }));

    const averageTicketByCurrency: MoneyMetric[] = Array.from(
      revenueByCurrency.entries()
    ).map(([currency, amount]) => {
      const count = completedCountByCurrency.get(currency) ?? 0;

      return {
        currency,
        amount: count === 0 ? 0 : amount / count,
      };
    });

    return {
      total_payments: totalPayments,
      total_refunds: totalRefunds,
      completed_revenue_by_currency: completedRevenueByCurrency,
      average_ticket_by_currency: averageTicketByCurrency,
    };
  });
};
