import {
  Payment,
  PaymentStatus,
} from '../entities/Payment';
import { PoolClient } from 'pg';
import { getNumberOfPages } from './utils';
import { DEFAULT_PAYMENTS_LIMIT, DEFAULT_PAYMENTS_OFFSET } from '../controllers/payment/GetPaymentsController';

export interface PaymentsPagined {
  payments: Payment[],
  numberOfPages: number
}

export interface PaymentSummaryMetric {
  currency: string;
  amount: number;
}

export interface PaymentsSummary {
  totalPayments: number;
  totalRefunds: number;
  completedRevenueByCurrency: PaymentSummaryMetric[];
  averageTicketByCurrency: PaymentSummaryMetric[];
}

export type PaymentSortBy =
  | 'id_pago'
  | 'email'
  | 'nombre'
  | 'curso'
  | 'importe'
  | 'moneda'
  | 'estado'
  | 'fecha'
  | 'refunded_at'

export type PaymentSortOrder = 'ASC' | 'DESC';

export interface PaymentFilters {
  status?: PaymentStatus;
  currency?: string;
  course?: string;
  name?: string,
  email?: string
}

interface PaymentFilterSql {
  whereSql: string;
  values: any[];
}

const buildPaymentFilterSql = (paymentFilters?: PaymentFilters): PaymentFilterSql => {
  const conditions: string[] = [];
  const values: any[] = [];

  if (paymentFilters?.status) {
    values.push(paymentFilters.status);
    conditions.push(`payments.estado = $${values.length}`);
  }

  if (paymentFilters?.currency) {
    values.push(paymentFilters.currency);
    conditions.push(`payments.moneda = $${values.length}`);
  }

  if (paymentFilters?.course) {
    values.push(`%${paymentFilters.course}%`);
    conditions.push(`payments.curso ILIKE $${values.length}`);
  }

  if (paymentFilters?.name) {
    values.push(`%${paymentFilters.name}%`);
    conditions.push(`payments.nombre ILIKE $${values.length}`);
  }

  if (paymentFilters?.email) {
    values.push(paymentFilters.email);
    conditions.push(`payments.email = $${values.length}`);
  }

  return {
    whereSql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

const sqlPayment = `
    payments.id_pago AS payments_id_pago,
    payments.email AS payments_email,
    payments.nombre AS payments_nombre,
    payments.curso AS payments_curso,
    payments.importe AS payments_importe,
    payments.moneda AS payments_moneda,
    payments.estado AS payments_estado,
    payments.fecha AS payments_fecha,
    payments.refunded_at AS payments_refunded_at
`

export const findPayments = async (
  poolClient: PoolClient, paymentFilters?: PaymentFilters,
  paymentSortOrder?: PaymentSortOrder, paymentSortBy?: PaymentSortBy,
  limit: number = DEFAULT_PAYMENTS_LIMIT,
  offset: number = DEFAULT_PAYMENTS_OFFSET
): Promise<PaymentsPagined> => {
  try {
    const { whereSql, values } = buildPaymentFilterSql(paymentFilters);

    values.push(limit)
    const limitIndex = values.length

    values.push(offset)
    const limitOffset = values.length

    const sortBy = paymentSortBy ?? "fecha"
    const sortOrder = paymentSortOrder ?? "DESC"

    const sql = `
      WITH windows_payments AS (
        SELECT 
          payments.id_pago,
          COUNT(payments.id_pago) OVER() AS count
        FROM operations.payments payments
        ${whereSql}
        ORDER BY payments.${sortBy} ${sortOrder}
        LIMIT $${limitIndex}
        OFFSET $${limitOffset}
      )
      SELECT 
        ${sqlPayment},
        windows_payments.count AS cantidad_de_filas
      FROM 
        operations.payments payments
      JOIN windows_payments ON 
        payments.id_pago = windows_payments.id_pago
      ORDER BY payments_${sortBy} ${sortOrder}
`
    const { rows } = await poolClient.query(sql, values)
    const totalRows = Number(rows[0]?.cantidad_de_filas ?? 0)
    const numberOfPages = getNumberOfPages(totalRows, limit)
    console.log(rows)

    return {
      payments: rows.map(loadPayment),
      numberOfPages: numberOfPages
    }
  } catch (error) {
    console.log(error)
    throw new Error("ERROR_FINDING_PAYMENTS")
  }
}

interface PaymentSummaryRow {
  total_payments: number | string;
  total_refunds: number | string;
  currency: string | null;
  completed_revenue: number | string | null;
  average_ticket: number | string | null;
}

export const getPaymentsSummary = async (
  poolClient: PoolClient,
  paymentFilters?: PaymentFilters,
): Promise<PaymentsSummary> => {
  try {
    const { whereSql, values } = buildPaymentFilterSql(paymentFilters);

    const sql = `
      WITH filtered_payments AS (
        SELECT
          payments.estado,
          payments.moneda,
          payments.importe
        FROM operations.payments payments
        ${whereSql}
      ),
      totals AS (
        SELECT
          COUNT(*)::int AS total_payments,
          COUNT(*) FILTER (WHERE estado = 'refunded')::int AS total_refunds
        FROM filtered_payments
      ),
      currency_metrics AS (
        SELECT
          moneda AS currency,
          SUM(importe)::numeric AS completed_revenue,
          AVG(importe)::numeric AS average_ticket
        FROM filtered_payments
        WHERE estado = 'completed'
        GROUP BY moneda
      )
      SELECT
        totals.total_payments,
        totals.total_refunds,
        currency_metrics.currency,
        COALESCE(currency_metrics.completed_revenue, 0)::numeric AS completed_revenue,
        COALESCE(currency_metrics.average_ticket, 0)::numeric AS average_ticket
      FROM totals
      LEFT JOIN currency_metrics ON true
      ORDER BY currency_metrics.currency ASC
    `;

    const { rows } = await poolClient.query<PaymentSummaryRow>(sql, values);
    const currencyRows = rows.filter(
      (row): row is PaymentSummaryRow & { currency: string } => row.currency !== null
    );

    return {
      totalPayments: Number(rows[0]?.total_payments ?? 0),
      totalRefunds: Number(rows[0]?.total_refunds ?? 0),
      completedRevenueByCurrency: currencyRows.map(row => ({
        currency: row.currency,
        amount: Number(row.completed_revenue ?? 0),
      })),
      averageTicketByCurrency: currencyRows.map(row => ({
        currency: row.currency,
        amount: Number(row.average_ticket ?? 0),
      })),
    };
  } catch (error) {
    console.log(error);
    throw new Error("ERROR_FINDING_PAYMENTS_SUMMARY");
  }
};

export const loadPayment = (row: any): Payment => {
  return Payment.loadPayment(
    row.payments_id_pago,
    row.payments_email,
    row.payments_nombre,
    row.payments_curso,
    Number(row.payments_importe),
    row.payments_moneda,
    row.payments_estado,
    new Date(row.payments_fecha),
    row.payments_refunded_at ? new Date(
      row.payments_refunded_at
    ) : null,
  )
};
