import {
  CountMetric,
  MoneyMetric,
  Payment,
  PaymentFilters,
  PaymentsSummary,
} from '../../entities/Payment';
import { findAllPayments } from '../../gateway/Payment';
import { buildFilters, SUPPORTED_CURRENCIES } from './shared';

export const GetPaymentsSummaryInteractor = async (
  filters: PaymentFilters = {}
): Promise<PaymentsSummary> => {
  const payments = await findAllPayments(buildFilters(filters));

  return {
    totalPayments: payments.length,
    totalRefunds: payments.filter(isRefunded).length,
    paymentsByCurrency: countByCurrency(payments),
    refundsByCurrency: countByCurrency(payments.filter(isRefunded)),
    completedRevenueByCurrency: sumCompletedRevenueByCurrency(payments),
    averageTicketByCurrency: averageCompletedTicketByCurrency(payments),
    lastUpdated: getLastUpdated(payments),
  };
};

function isRefunded(payment: Payment): boolean {
  return payment.estado === 'refunded' || Boolean(payment.refunded_at);
}

function countByCurrency(payments: Payment[]): CountMetric[] {
  return SUPPORTED_CURRENCIES
    .map((currency) => ({
      currency,
      count: payments.filter((payment) => payment.moneda === currency).length,
    }))
    .filter((item) => item.count > 0);
}

function sumCompletedRevenueByCurrency(payments: Payment[]): MoneyMetric[] {
  return SUPPORTED_CURRENCIES
    .map((currency) => ({
      currency,
      amount: payments
        .filter((payment) => payment.estado === 'completed' && payment.moneda === currency)
        .reduce((total, payment) => total + payment.importe, 0),
    }))
    .filter((item) => item.amount > 0);
}

function averageCompletedTicketByCurrency(payments: Payment[]): MoneyMetric[] {
  return SUPPORTED_CURRENCIES
    .map((currency) => {
      const completedPayments = payments.filter(
        (payment) => payment.estado === 'completed' && payment.moneda === currency
      );
      const amount = completedPayments.length
        ? completedPayments.reduce((total, payment) => total + payment.importe, 0) / completedPayments.length
        : 0;

      return { currency, amount };
    })
    .filter((item) => item.amount > 0);
}

function getLastUpdated(payments: Payment[]): string | null {
  const timestamps = payments
    .map((payment) => new Date(payment.fecha).getTime())
    .filter((value) => Number.isFinite(value));

  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}
