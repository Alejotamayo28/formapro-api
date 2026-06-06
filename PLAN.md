# Plan: Fix `GET /payments/summary`

## Context

`GetPaymentsSummaryController` currently exposes `GET /payments/summary` with an optional `course` query param. The interactor calculates the summary by calling `findPayments` with `MAX_PAYMENTS_LIMIT` (`1000`) and aggregating the returned `Payment` entities in memory. This makes the summary incorrect when more than 1000 rows match, and it does unnecessary row hydration for aggregate metrics.

Assumption for this plan: the summary endpoint should remain backward compatible and should also support the same filter set as `GET /payments` so dashboard totals can match the filtered payments table.

## Approach

Move summary aggregation into PostgreSQL with a dedicated aggregate query that reuses the existing `PaymentFilters` shape. The query will apply filters without pagination, calculate total payments/refunds and completed revenue/average ticket grouped by currency, and return the same response shape currently documented.

Also regenerate TSOA routes/OpenAPI after changing controller query params, and update the README known limitation that says summary is capped at 1000 rows.

## Proposed code changes

Controller filter signature will be expanded to mirror `GET /payments`:

```ts
public async getPaymentsSummary(
  @Query() status?: PaymentStatus,
  @Query() currency?: PaymentCurrency,
  @Query() course?: string,
  @Query() name?: string,
  @Query() email?: string,
): Promise<PaymentsSummaryResponse> {
  const paymentFilters: PaymentFilters = { status, currency, course, name, email };
  return GetPaymentsSummaryInteractor(paymentFilters);
}
```

`src/gateway/Payment.ts` will get a reusable filter builder based on the current `findPayments` conditions:

```ts
const buildPaymentFilterSql = (paymentFilters?: PaymentFilters) => {
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
    values,
    whereSql: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
  };
};
```

The new summary query will aggregate directly in PostgreSQL and will not use `LIMIT`/`OFFSET`:

```sql
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
LEFT JOIN currency_metrics ON true;
```

The gateway result mapping will use the first row for totals and only rows with a non-null `currency` for the money arrays:

```ts
return {
  totalPayments: Number(rows[0]?.total_payments ?? 0),
  totalRefunds: Number(rows[0]?.total_refunds ?? 0),
  completedRevenueByCurrency: rows
    .filter(row => row.currency)
    .map(row => ({ currency: row.currency, amount: Number(row.completed_revenue) })),
  averageTicketByCurrency: rows
    .filter(row => row.currency)
    .map(row => ({ currency: row.currency, amount: Number(row.average_ticket) })),
};
```

The interactor will translate that gateway result back to the existing public API response keys. Example JSON response:

```json
{
  "total_payments": 1250,
  "total_refunds": 35,
  "completed_revenue_by_currency": [
    {
      "currency": "cop",
      "amount": 24800000
    },
    {
      "currency": "usd",
      "amount": 4300
    }
  ],
  "average_ticket_by_currency": [
    {
      "currency": "cop",
      "amount": 160000
    },
    {
      "currency": "usd",
      "amount": 86
    }
  ]
}
```

If there are matching payments but no completed payments, the money arrays stay empty while totals are still returned:

```json
{
  "total_payments": 8,
  "total_refunds": 8,
  "completed_revenue_by_currency": [],
  "average_ticket_by_currency": []
}
```

## Files to modify

- `src/controllers/payment/GetPaymentsSummaryController.ts`
- `src/interactors/payment/GetPaymentsSummaryInteractor.ts`
- `src/gateway/Payment.ts`
- `src/routes/routes.ts` — generated by `npm run generate-docs`
- `docs/swagger.json` — generated by `npm run generate-docs`
- `README.md`

## Reuse

- `PaymentFilters`, `PaymentCurrency`, and filter behavior from `src/gateway/Payment.ts`
- `onSession` from `src/gateway/supabase/Basic.ts`
- TSOA controller/query-param patterns from `src/controllers/payment/GetPaymentsController.ts`
- Existing response interfaces in `src/interactors/payment/GetPaymentsSummaryInteractor.ts`

## Steps

- [ ] Extract reusable SQL filter construction in `src/gateway/Payment.ts` so both `findPayments` and the new summary query use the same parameterized conditions for `status`, `currency`, `course`, `name`, and `email`.
- [ ] Add a dedicated summary gateway function in `src/gateway/Payment.ts` that runs an aggregate PostgreSQL query without `LIMIT`/`OFFSET`.
- [ ] Update `GetPaymentsSummaryInteractor` to call the new summary gateway function instead of `findPayments`, removing the `MAX_PAYMENTS_LIMIT` dependency and in-memory aggregation.
- [ ] Update `GetPaymentsSummaryController` to accept the same filters as `GET /payments`: `status`, `currency`, `course`, `name`, and `email`.
- [ ] Regenerate TSOA routes and OpenAPI docs with `npm run generate-docs`.
- [ ] Update `README.md` so the known limitation only applies to CSV export if that endpoint still uses a 1000-row limit.

## Verification

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run generate-docs` and confirm `/payments/summary` documents the added query params.
- [ ] Manually call `GET /payments/summary` with no filters and compare totals against direct SQL counts over `operations.payments`.
- [ ] Manually call `GET /payments/summary?course=<value>` and confirm the SQL uses `ILIKE` behavior matching `GET /payments`.
- [ ] Manually call combinations such as `currency=usd`, `status=completed`, and `email=<value>` and confirm the response matches the filtered dataset.
- [ ] Confirm datasets with more than 1000 matching payments are fully counted, not capped.
