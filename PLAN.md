# Plan: Implementar endpoint `GET /payments/summary`

## Context

La prueba técnica requiere que el dashboard muestre indicadores de pagos desde Supabase:

- Ingresos totales solo de pagos `completed`.
- Número total de pagos.
- Número de reembolsos.
- Ticket medio.
- Soporte para múltiples monedas sin mezclar valores monetarios.

El backend ya tiene una función reutilizable en `src/gateway/Payment.ts`:

```ts
findPayments(...)
```

Esta función consulta `operations.payments`, aplica filtros opcionales y devuelve entidades `Payment`. Para este paso se reutilizará esa función invocándola con un `limit` alto, evitando crear una nueva query SQL específica por ahora.

## Approach

Implementar el endpoint `GET /payments/summary` siguiendo la arquitectura existente:

```text
GetPaymentsSummaryController
  -> GetPaymentsSummaryInteractor
    -> findPayments
      -> operations.payments
```

El controller recibirá filtros básicos, inicialmente `course`, y delegará el cálculo al interactor.

El interactor llamará a `findPayments` con:

```ts
limit = 100000
offset = 0
```

Después calculará los KPIs en memoria:

- `total_payments`: cantidad total de pagos retornados.
- `total_refunds`: cantidad de pagos con `estado === 'refunded'`.
- `completed_revenue_by_currency`: suma de `importe` agrupada por `moneda`, solo para `estado === 'completed'`.
- `average_ticket_by_currency`: promedio de `importe` agrupado por `moneda`, solo para `estado === 'completed'`.

No se deben sumar monedas diferentes entre sí. El response debe devolver `currency` y `amount`, dejando el formateo monetario al frontend con `Intl.NumberFormat`.

## Files to modify

- `src/controllers/payment/GetPaymentsSummaryController.ts`
- `src/interactors/payment/GetPaymentsSummaryInteractor.ts` nuevo archivo

## Proposed file contents

### `src/interactors/payment/GetPaymentsSummaryInteractor.ts`

```ts
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
```

### `src/controllers/payment/GetPaymentsSummaryController.ts`

```ts
import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { PaymentFilters } from '../../gateway/Payment';
import {
  GetPaymentsSummaryInteractor,
  PaymentsSummaryResponse,
} from '../../interactors/payment/GetPaymentsSummaryInteractor';

@Route('payments')
@Tags('Payments')
export class GetPaymentsSummaryController extends Controller {
  @Get('summary')
  public async getPaymentsSummary(
    @Query() course?: string
  ): Promise<PaymentsSummaryResponse> {
    const paymentFilters: PaymentFilters = {
      course,
    };

    return GetPaymentsSummaryInteractor(paymentFilters);
  }
}
```

## Reuse

- `src/gateway/Payment.ts`
  - Reutilizar `findPayments`.
  - Reutilizar `PaymentFilters`.
- `src/entities/Payment.ts`
  - Reutilizar `PaymentCurrency`.
  - Reutilizar getters de la entidad `Payment`:
    - `getEstado()`
    - `getMoneda()`
    - `getImporte()`
- `src/gateway/supabase/Basic.ts`
  - Reutilizar `onSession` para abrir/cerrar sesión con Postgres/Supabase.

## Steps

- [ ] Crear `src/interactors/payment/GetPaymentsSummaryInteractor.ts`.
- [ ] Definir interfaces de response:
  - [ ] `MoneyMetric` con `currency` y `amount`.
  - [ ] `PaymentsSummaryResponse` con los KPIs requeridos.
- [ ] En el interactor, invocar `findPayments(poolClient, filters, undefined, undefined, 100000, 0)`.
- [ ] Calcular `total_payments` con `payments.length`.
- [ ] Calcular `total_refunds` filtrando `estado === 'refunded'`.
- [ ] Calcular ingresos `completed` agrupados por moneda usando `Map<PaymentCurrency, number>`.
- [ ] Calcular cantidad de pagos `completed` por moneda para obtener ticket medio.
- [ ] Retornar el summary en formato JSON.
- [ ] Actualizar `GetPaymentsSummaryController` para:
  - [ ] Importar el nuevo interactor.
  - [ ] Importar `PaymentFilters`.
  - [ ] Recibir `course?: string` como query param.
  - [ ] Retornar `Promise<PaymentsSummaryResponse>`.
- [ ] Ejecutar generación/build para validar TSOA y TypeScript.

## Verification

- Ejecutar:

```bash
npm run build
```

- Levantar API local:

```bash
npm run dev
```

- Probar endpoint sin filtros:

```http
GET /payments/summary
```

- Probar endpoint con filtro por curso:

```http
GET /payments/summary?course=Excel
```

- Validar manualmente que:
  - `total_payments` coincide con la cantidad de pagos considerados.
  - `total_refunds` solo cuenta pagos `refunded`.
  - `completed_revenue_by_currency` solo suma pagos `completed`.
  - `average_ticket_by_currency` se calcula solo con pagos `completed`.
  - COP, USD u otras monedas aparecen separadas y no mezcladas.

## Notes

Esta solución es adecuada para avanzar rápido en la prueba técnica reutilizando la función existente. A futuro, si la tabla crece mucho, convendría reemplazar el cálculo en memoria por una query SQL agregada con `COUNT`, `SUM`, `AVG`, `FILTER` y `GROUP BY moneda`.
