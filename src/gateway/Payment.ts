import {
  Payment,
  PaymentCurrency,
  PaymentStatus,
} from '../entities/Payment';
import { PoolClient } from 'pg';
import { getNumberOfPages } from './utils';

export interface PaymentsPagined {
  payments: Payment[],
  numberOfPages: number
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
  currency?: PaymentCurrency;
  course?: string;
  name?: string,
  email?: string
}

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
  limit: number = 10, offset: number = 0
): Promise<PaymentsPagined> => {
  const conditions: string[] = []
  const values: any[] = []
  try {

    if (paymentFilters) {

      if (paymentFilters.status) {
        values.push(paymentFilters.status)
        conditions.push(`payments.estado = $${values.length}`)
      }

      if (paymentFilters.currency) {
        values.push(paymentFilters.currency);
        conditions.push(`payments.moneda = $${values.length}`);
      }

      if (paymentFilters.course) {
        values.push(`%${paymentFilters.course}%`);
        conditions.push(`payments.curso ILIKE $${values.length}`);
      }

      if (paymentFilters.name) {
        values.push(`%${paymentFilters.name}%`);
        conditions.push(`payments.nombre ILIKE $${values.length}`);
      }

      if (paymentFilters.email) {
        values.push(paymentFilters.email);
        conditions.push(`payments.email = $${values.length}`);
      }
    }

    values.push(limit)
    const limitIndex = values.length

    values.push(offset)
    const limitOffset = values.length

    const sortBy = paymentSortBy ?? "payments.fecha"
    const sortOrder = paymentSortOrder ?? "DESC"
    const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

    const sql = `
      WITH windows_payments AS (
        SELECT 
          payments.id_pago,
          COUNT(payments.id_pago) OVER() AS count
        FROM operations.payments payments
        ${whereSql}
        ORDER BY ${sortBy} ${sortOrder}
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
      ORDER BY ${sortBy} ${sortOrder}
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
