import { PoolClient } from 'pg';
import { findPayments, PaymentFilters, PaymentSortBy, PaymentSortOrder } from '../../gateway/Payment';
import { onSession } from '../../gateway/supabase/Basic';

export interface PaymentsResponse {
  pago_id: string,
  email: string,
  nombre: string | null,
  curso: string,
  importe: number
  moneda: string,
  fecha: string,
  refunded_at: string | null
}

export interface PaymentsWithPagesResponse {
  payments: PaymentsResponse[];
  number_of_pages: number;
}

export const GetPaymentsInteractor = async (
  paymentFilters?: PaymentFilters, paymentSortOrder?: PaymentSortOrder, paymentSortBy?: PaymentSortBy, limit?: number, offset?: number
): Promise<PaymentsWithPagesResponse> => {
  return onSession(async (poolClient: PoolClient) => {
    const response = await findPayments(poolClient, paymentFilters, paymentSortOrder, paymentSortBy, limit, offset);

    return {
      payments: response.payments.map((payment) => {
        return {
          pago_id: payment.getIdPago(),
          email: payment.getEmail(),
          nombre: payment.getNombre(),
          curso: payment.getCurso(),
          importe: payment.getImporte(),
          moneda: payment.getMoneda(),
          fecha: payment.getFecha().toISOString(),
          refunded_at: payment.getRefundedAt()?.toISOString() || null
        }
      }),
      number_of_pages: response.numberOfPages
    }
  })
};
