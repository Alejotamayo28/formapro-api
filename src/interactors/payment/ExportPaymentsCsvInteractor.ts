import { PoolClient } from 'pg';
import { findPayments, PaymentFilters } from '../../gateway/Payment';
import { onSession } from '../../gateway/supabase/Basic';
import { paymentsToCsv } from '../../utils/csv';

const EXPORT_LIMIT = 100000;

export const ExportPaymentsCsvInteractor = async (
  paymentFilters?: PaymentFilters
): Promise<string> => {
  return onSession(async (poolClient: PoolClient) => {
    const response = await findPayments(
      poolClient,
      paymentFilters,
      undefined,
      undefined,
      EXPORT_LIMIT,
      0
    );

    return paymentsToCsv(response.payments);
  });
};
