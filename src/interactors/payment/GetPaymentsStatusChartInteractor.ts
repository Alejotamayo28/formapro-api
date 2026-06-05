import { PaymentFilters, PaymentStatus, StatusChartItem } from '../../entities/Payment';
import { findAllPayments } from '../../gateway/Payment';
import { buildFilters, SUPPORTED_STATUSES } from './shared';

export const GetPaymentsStatusChartInteractor = async (
  filters: PaymentFilters = {}
): Promise<StatusChartItem[]> => {
  const payments = await findAllPayments(buildFilters(filters));

  return SUPPORTED_STATUSES
    .map((status: PaymentStatus) => ({
      status,
      count: payments.filter((payment) => payment.estado === status).length,
    }))
    .filter((item) => item.count > 0);
};
