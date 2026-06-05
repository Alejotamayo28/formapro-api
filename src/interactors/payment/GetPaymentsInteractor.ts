import { PoolClient } from 'pg';
import { findPayments, PaymentFilters, PaymentSortBy, PaymentSortOrder } from '../../gateway/Payment';
import { onSession } from '../../gateway/supabase/Basic';


export interface PaymentsResponse {
  pago_id: string,
  email: string,
  nombre: string,
  curso: string,
  importe: string,
  moneda: string,
  fecha: Date,
  refunded_at: Date
}

export interface PaymentsWithPagesResponse {
  payments: PaymentsResponse[];
  number_of_pages: number;
}

export const GetPaymentsInteractor = async (
  paymentFilters?: PaymentFilters, paymentSortOrder?: PaymentSortOrder, paymentSortBy?: PaymentSortBy, limit?: number, offset?: number
): Promise<PaginatedPaymentsResponse> => {
  return onSession(async (poolClient: PoolClient) => {

    return findPayments(poolClient, paymentFilters, paymentSortOrder, paymentSortBy, limit, offset);

  })
};
