# Plan: Implementar endpoint `GET /payments/export.csv`

## Context

El endpoint CSV existe a nivel de controller:

```http
GET /payments/export.csv
```

pero el interactor actual no compila porque referencia piezas que ya no existen o no están exportadas:

- `PaymentFilters` desde `../../entities/Payment`, pero actualmente está en `src/gateway/Payment.ts`.
- `findAllPayments` desde `../../gateway/Payment`, pero la función disponible es `findPayments`.
- `buildFilters` desde `./shared`, pero `shared.ts` ya no existe.

La utilidad `src/utils/csv.ts` sí existe y ya convierte `Payment[]` a CSV usando los campos requeridos:

```ts
paymentsToCsv(payments)
```

## How it works in the dashboard page

Con la estructura actual del dashboard habría dos apartados principales:

1. **Apartado de búsqueda/listado de pagos**
   - Consume `GET /payments`.
   - Muestra tabla paginada.
   - Permite filtros como `status`, `currency`, `course`, `name`, `email`.
   - Tiene controles de paginación, ordenamiento y búsqueda.

2. **Apartado de resumen total/KPIs**
   - Consume `GET /payments/summary`.
   - Muestra ingresos `completed`, cantidad de pagos, reembolsos y ticket medio.
   - No representa filas individuales, sino agregados.

El botón **Exportar CSV** debe pertenecer al **apartado de búsqueda/listado de pagos**, no al bloque de summary.

La razón es que un CSV normalmente exporta registros tabulares, es decir, las mismas filas de pagos que el usuario está consultando en la tabla. El summary devuelve métricas agregadas y no tiene suficiente detalle para crear un reporte fila por fila.

Comportamiento recomendado:

- Si el usuario no tiene filtros activos, el CSV exporta todos los pagos encontrados hasta `EXPORT_LIMIT`.
- Si el usuario tiene filtros activos en la tabla, el CSV exporta todos los pagos que coinciden con esos filtros.
- Sí: la idea es traer **todos los registros filtrados**, pero **sin usar el `limit` ni el `offset` de la tabla paginada**. Como el gateway actual exige `limit` y `offset`, internamente usaremos `EXPORT_LIMIT = 100000` y `offset = 0` como solución temporal. Para el frontend, el endpoint CSV no recibirá paginación.
- El CSV **no debería exportar solo la página actual**, sino todos los resultados filtrados. Por ejemplo, si la tabla muestra página 1 de 10, el CSV debería exportar las 10 páginas filtradas, no solo los 10 o 25 registros visibles.
- El CSV no exporta el apartado de summary. Si más adelante se quiere descargar KPIs, eso sería otro endpoint o un modo diferente, por ejemplo `/payments/summary/export.csv`.

Ejemplo visual del dashboard:

```text
Dashboard de Pagos

[KPIs / Summary]
Ingresos completed | Nº pagos | Nº reembolsos | Ticket medio
Fuente: GET /payments/summary

[Buscar pagos]
Status [completed]  Moneda [cop]  Curso [Excel]  Buscar [email/nombre]
[Aplicar filtros] [Exportar CSV]

Tabla de pagos paginada
Fuente: GET /payments?status=completed&currency=cop&course=Excel&page=1

Al hacer click en [Exportar CSV]:
GET /payments/export.csv?status=completed&currency=cop&course=Excel
```

El navegador recibirá una respuesta con estos headers:

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="payments.csv"
```

Eso hace que el navegador descargue un archivo llamado `payments.csv`.

Ejemplo de uso desde frontend:

```ts
const params = new URLSearchParams();

if (status) params.set('status', status);
if (currency) params.set('currency', currency);
if (course) params.set('course', course);
if (name) params.set('name', name);
if (email) params.set('email', email);

// No se envía limit ni offset porque CSV exporta todos los resultados filtrados.
window.location.href = `${API_URL}/payments/export.csv?${params.toString()}`;
```

El resultado para negocio es: el usuario puede filtrar la tabla de pagos y descargar un CSV con esos mismos criterios para abrirlo en Excel, Google Sheets o enviarlo como reporte.

## Approach

Mantener el endpoint `GET /payments/export.csv` y corregir el interactor para reutilizar la función ya existente `findPayments`, igual que en el endpoint summary.

Flujo propuesto:

```text
ExportPaymentsCsvController
  -> ExportPaymentsCsvInteractor
    -> findPayments
      -> paymentsToCsv
```

Para exportar todos los pagos filtrados sin modificar todavía el gateway, el interactor llamará a `findPayments` con un límite alto:

```ts
limit = 100000
offset = 0
```

Importante: esto significa que el CSV no usará la paginación visual de la tabla. El usuario puede estar viendo página 2 con `limit=25`, pero el CSV ignorará ese `limit/offset` de UI y exportará todos los registros que cumplan los filtros, hasta `EXPORT_LIMIT`.

El CSV respetará todos los filtros disponibles en `PaymentFilters`:

- `status`
- `currency`
- `course`
- `name`
- `email`

El controller ya setea los headers correctos para descarga:

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="payments.csv"
```

## Files to modify

- `src/interactors/payment/ExportPaymentsCsvInteractor.ts`
- `src/controllers/payment/ExportPaymentsCsvController.ts`

## Proposed file contents

### `src/interactors/payment/ExportPaymentsCsvInteractor.ts`

```ts
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
```

### `src/controllers/payment/ExportPaymentsCsvController.ts`

Se actualizará el controller para agregar `name` y `email`, así el CSV puede reutilizar todos los filtros existentes del gateway.

```ts
import { Controller, Get, Produces, Query, Route, Tags } from 'tsoa';
import { PaymentCurrency, PaymentStatus } from '../../entities/Payment';
import { PaymentFilters } from '../../gateway/Payment';
import { ExportPaymentsCsvInteractor } from '../../interactors/payment/ExportPaymentsCsvInteractor';

@Route('payments')
@Tags('Payments')
export class ExportPaymentsCsvController extends Controller {
  @Get('export.csv')
  @Produces('text/csv')
  public async exportPaymentsCsv(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string,
    @Query() name?: string,
    @Query() email?: string
  ): Promise<string> {
    const paymentFilters: PaymentFilters = {
      status,
      currency,
      course,
      name,
      email,
    };

    const csv = await ExportPaymentsCsvInteractor(paymentFilters);

    this.setHeader('Content-Type', 'text/csv; charset=utf-8');
    this.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

    return csv;
  }
}
```

## Why `Promise<string>`?

El endpoint devuelve `Promise<string>` porque el controller/interactor son funciones `async`, y en TypeScript toda función `async` retorna una `Promise`.

El valor interno resuelto por la promesa es un `string` porque el CSV finalmente es texto plano, por ejemplo:

```csv
id_pago,email,nombre,curso,importe,moneda,estado,fecha,refunded_at
pay_1,test@example.com,Ana,Excel,100000,cop,completed,2025-01-01,
```

TSOA/Express enviará ese `string` como cuerpo de la respuesta HTTP con `Content-Type: text/csv`.

## Total code changes preview

Estos serían los cambios totales expresados como diff conceptual.

```diff
diff --git a/src/interactors/payment/ExportPaymentsCsvInteractor.ts b/src/interactors/payment/ExportPaymentsCsvInteractor.ts
--- a/src/interactors/payment/ExportPaymentsCsvInteractor.ts
+++ b/src/interactors/payment/ExportPaymentsCsvInteractor.ts
@@
-import { PaymentFilters } from '../../entities/Payment';
-import { findAllPayments } from '../../gateway/Payment';
+import { PoolClient } from 'pg';
+import { findPayments, PaymentFilters } from '../../gateway/Payment';
+import { onSession } from '../../gateway/supabase/Basic';
 import { paymentsToCsv } from '../../utils/csv';
-import { buildFilters } from './shared';
+
+const EXPORT_LIMIT = 100000;
 
 export const ExportPaymentsCsvInteractor = async (
-  filters: PaymentFilters = {}
+  paymentFilters?: PaymentFilters
 ): Promise<string> => {
-  const payments = await findAllPayments(buildFilters(filters));
-  return paymentsToCsv(payments);
+  return onSession(async (poolClient: PoolClient) => {
+    const response = await findPayments(
+      poolClient,
+      paymentFilters,
+      undefined,
+      undefined,
+      EXPORT_LIMIT,
+      0
+    );
+
+    return paymentsToCsv(response.payments);
+  });
 };
```

```diff
diff --git a/src/controllers/payment/ExportPaymentsCsvController.ts b/src/controllers/payment/ExportPaymentsCsvController.ts
--- a/src/controllers/payment/ExportPaymentsCsvController.ts
+++ b/src/controllers/payment/ExportPaymentsCsvController.ts
@@
 import { Controller, Get, Produces, Query, Route, Tags } from 'tsoa';
 import { PaymentCurrency, PaymentStatus } from '../../entities/Payment';
+import { PaymentFilters } from '../../gateway/Payment';
 import { ExportPaymentsCsvInteractor } from '../../interactors/payment/ExportPaymentsCsvInteractor';
@@
   public async exportPaymentsCsv(
     @Query() status?: PaymentStatus,
     @Query() currency?: PaymentCurrency,
-    @Query() course?: string
+    @Query() course?: string,
+    @Query() name?: string,
+    @Query() email?: string
   ): Promise<string> {
-    const csv = await ExportPaymentsCsvInteractor({
+    const paymentFilters: PaymentFilters = {
       status,
       currency,
       course,
+      name,
+      email,
+    };
+
+    const csv = await ExportPaymentsCsvInteractor(paymentFilters);
```

No se modificaría `src/utils/csv.ts` porque ya hace correctamente:

- headers del CSV,
- escape de comillas,
- escape de comas,
- escape de saltos de línea,
- conversión de `Payment[]` a string CSV.

Tampoco se modificaría `src/gateway/Payment.ts` en esta iteración porque reutilizaremos `findPayments` con `EXPORT_LIMIT`.

## Reuse

- `src/gateway/Payment.ts`
  - Reutilizar `findPayments`.
  - Reutilizar `PaymentFilters`.
- `src/gateway/supabase/Basic.ts`
  - Reutilizar `onSession`.
- `src/utils/csv.ts`
  - Reutilizar `paymentsToCsv`.
  - Reutilizar el escape CSV existente para comillas, comas y saltos de línea.
- `src/entities/Payment.ts`
  - Reutilizar `PaymentStatus` y `PaymentCurrency` en el controller.

## Steps

- [ ] Actualizar imports de `ExportPaymentsCsvInteractor`.
- [ ] Eliminar referencias rotas a:
  - [ ] `PaymentFilters` desde `entities/Payment`.
  - [ ] `findAllPayments`.
  - [ ] `buildFilters`.
  - [ ] `./shared`.
- [ ] Importar `PoolClient`, `findPayments`, `PaymentFilters`, `onSession` y `paymentsToCsv`.
- [ ] Definir constante `EXPORT_LIMIT = 100000`.
- [ ] Invocar `findPayments(poolClient, filters, undefined, undefined, EXPORT_LIMIT, 0)`.
- [ ] Convertir `response.payments` a CSV con `paymentsToCsv`.
- [ ] Actualizar `ExportPaymentsCsvController` para aceptar filtros `name` y `email`.
- [ ] Ejecutar build para regenerar TSOA y validar TypeScript.

## Verification

- Ejecutar:

```bash
npm run build
```

- Levantar API local:

```bash
npm run dev
```

- Probar descarga sin filtros:

```http
GET /payments/export.csv
```

- Probar descarga con filtros:

```http
GET /payments/export.csv?status=completed
GET /payments/export.csv?currency=cop
GET /payments/export.csv?course=Excel
GET /payments/export.csv?name=Alejandro
GET /payments/export.csv?email=test@example.com
```

- Validar que el CSV tenga headers:

```csv
id_pago,email,nombre,curso,importe,moneda,estado,fecha,refunded_at
```

- Validar manualmente que:
  - El archivo se descarga como `payments.csv`.
  - Los filtros aplican igual que en `GET /payments`.
  - Los valores con coma, comillas o saltos de línea se escapan correctamente.
  - El build ya no falla por `ExportPaymentsCsvInteractor.ts`.

## Notes

Esta solución mantiene consistencia con el endpoint summary: reutiliza `findPayments` con límite alto para avanzar rápido. Más adelante, si la tabla crece mucho, se podría implementar paginación interna por batches o una query específica de exportación sin `LIMIT` fijo.
