import { PaymentFilters } from '../../entities/Payment';
import { findAllPayments } from '../../gateway/Payment';
import { paymentsToCsv } from '../../utils/csv';
import { buildFilters } from './shared';

export const ExportPaymentsCsvInteractor = async (
  filters: PaymentFilters = {}
): Promise<string> => {
  const payments = await findAllPayments(buildFilters(filters));
  return paymentsToCsv(payments);
};
