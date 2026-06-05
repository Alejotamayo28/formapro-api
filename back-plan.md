# Backend Plan — Dashboard de Pagos

## Context

El directorio `basic-api/` contiene la especificación de la **Prueba Técnica 2 — Dashboard de Pagos**. El dashboard debe leer la tabla existente `operations.payments` en Supabase y exponer datos agregados para KPIs, gráficos, filtros, búsqueda y exportación.

El directorio padre ya contiene la solución anterior de n8n + Supabase que alimenta la tabla `operations.payments`. Por eso el backend del dashboard no debe crear pagos ni procesar webhooks; su responsabilidad principal es **consultar, agregar, validar acceso y entregar datos limpios al frontend**.

## Backend Architecture

Arquitectura recomendada:

```text
Frontend React/Vite
  ↓ HTTP
Backend API TypeScript + TSOA
  ↓ Supabase JS / PostgREST
Supabase operations.payments
```

El backend funcionará como una capa intermedia entre el frontend y Supabase para evitar duplicar lógica de negocio en la UI y para centralizar:

- Consultas a `operations.payments`.
- Cálculo de KPIs.
- Agrupaciones por moneda, estado y fecha.
- Filtros y búsqueda.
- Exportación CSV.
- Manejo consistente de errores.
- Validación de parámetros.

## Approach

Implementar una API REST en TypeScript usando TSOA para tener controladores tipados, validaciones y documentación OpenAPI.

La API debe ser de solo lectura para el dashboard:

- No crea pagos.
- No actualiza pagos.
- No elimina pagos.
- Solo consulta y transforma datos existentes.

Los datos base se leen desde:

```text
operations.payments
```

Campos esperados:

```text
id_pago
email
nombre
curso
importe
moneda
estado
fecha
refunded_at
created_at
updated_at
```

El backend debe tratar `email` y `nombre` de forma defensiva porque hay una diferencia entre la especificación del dashboard y el SQL real del proyecto anterior:

- En la prueba del dashboard, `email` aparece como nullable y `nombre` como `NOT NULL`.
- En el SQL real anterior, `email` es `NOT NULL` y `nombre` es nullable.

## API Design

### `GET /health`

Verifica que la API esté viva.

Respuesta esperada:

```json
{
  "ok": true
}
```

### `GET /payments`

Devuelve pagos paginados y filtrados.

Query params sugeridos:

```text
status=completed|failed|refunded
currency=COP|USD
course=Excel Avanzado
search=ana@gmail.com
from=2026-05-01
until=2026-05-31
page=1
pageSize=25
sortBy=fecha
sortOrder=desc
```

Debe buscar por:

- `id_pago`
- `email`
- `nombre`
- `curso`

### `GET /payments/summary`

Devuelve KPIs del dashboard.

Debe calcular:

- Total de pagos.
- Total de reembolsos.
- Ticket promedio.
- Ingresos completados agrupados por moneda.

Importante: no sumar directamente monedas distintas.

Este endpoint sí debe devolver el resumen separado para las monedas que manejaremos en esta prueba: **COP y USD**. No se agregará lógica dinámica para monedas adicionales; la base de datos se asume con pagos en COP y/o USD.

Respuesta conceptual:

```json
{
  "totalPayments": 8,
  "totalRefunds": 1,
  "averageTicketByCurrency": [
    { "currency": "COP", "amount": 101250 },
    { "currency": "USD", "amount": 45 }
  ],
  "completedRevenueByCurrency": [
    { "currency": "COP", "amount": 405000 },
    { "currency": "USD", "amount": 90 }
  ]
}
```

Notas:

- `completedRevenueByCurrency` agrupa solo pagos `completed`.
- `averageTicketByCurrency` calcula ticket promedio por moneda, no global.
- Si COP o USD existen solo en pagos `failed` o `refunded`, pueden aparecer en métricas de conteo por moneda, pero no deben sumar en ingresos completados.

### `GET /payments/charts/status`

Devuelve cantidad de pagos por estado.

Ejemplo:

```json
[
  { "status": "completed", "count": 4 },
  { "status": "refunded", "count": 1 }
]
```

### `GET /payments/charts/revenue-timeline`

Devuelve evolución temporal de ingresos completados.

Query params sugeridos:

```text
granularity=day|week|month
currency=COP
from=2026-05-01
until=2026-05-31
```

### `GET /payments/export.csv`

Exporta en CSV los datos visibles según filtros.

Debe respetar los mismos filtros de `GET /payments`.

## Files to Modify / Create

Backend propuesto dentro de `basic-api/` usando la arquitectura acordada:

```text
basic-api/
├── package.json
├── tsconfig.json
├── tsoa.json
├── .env.example
└── src/
    ├── app.ts
    ├── server.ts
    ├── controllers/
    │   ├── health.ts
    │   └── payment/
    │       ├── GetPaymentsController.ts
    │       ├── GetPaymentsSummaryController.ts
    │       ├── GetPaymentsStatusChartController.ts
    │       ├── GetPaymentsTimelineController.ts
    │       └── ExportPaymentsCsvController.ts
    ├── interactors/
    │   └── payment/
    │       ├── GetPaymentsInteractor.ts
    │       ├── GetPaymentsSummaryInteractor.ts
    │       ├── GetPaymentsStatusChartInteractor.ts
    │       ├── GetPaymentsTimelineInteractor.ts
    │       └── ExportPaymentsCsvInteractor.ts
    ├── entities/
    │   └── Payment.ts
    ├── gateway/
    │   ├── Payment.ts
    │   └── supabase/
    │       └── Basic.ts
    ├── utils/
    │   ├── csv.ts
    │   └── dates.ts
    └── middleware/
        └── errorHandler.ts
```

Responsabilidades:

- `src/controllers/health.ts`
  - Controlador simple de health check.
- `src/controllers/payment/<funcion>Controller.ts`
  - Controladores HTTP por función de pagos.
  - Validaciones de entrada con TSOA.
  - Definición de rutas, query params y contratos OpenAPI.
- `src/interactors/payment/<funcion>Interactor.ts`
  - Interactores por caso de uso.
  - Lógica de negocio del dashboard.
  - Cálculo de KPIs.
  - Agrupaciones por moneda, estado y fecha.
  - Reglas como no mezclar COP y USD.
- `src/entities/Payment.ts`
  - Entidad que representa la tabla `operations.payments`.
  - Tipos compartidos entre controller, interactor y gateway.
- `src/gateway/supabase/Basic.ts`
  - Configuración básica del cliente Supabase.
  - Lectura de variables de entorno.
  - No contiene lógica de pagos.
- `src/gateway/Payment.ts`
  - Consultas SQL/PostgREST contra `operations.payments`.
  - No usar ORM.
  - Mantener aquí filtros, paginación, ordenamiento y queries de agregación cuando convenga resolverlas en base de datos.

## Reuse

Reutilizar conocimiento y estructura existente del directorio padre:

- `../supabase_operations_payments.sql`
  - Fuente real de la estructura de tabla.
- `../supabase_payments_evidence.json`
  - Dataset esperado para validar KPIs y gráficos.
- `../supabase_payments_evidence.csv`
  - Referencia para exportación CSV.
- `../test_payments.json`
  - Casos de negocio: completed, failed, refunded, duplicados y datos normalizados.
- `../README.md` y `../ui/README.md`
  - Explican reglas de negocio previas: idempotencia, refunded y pagos failed ignorados.

## Business Rules

- Los ingresos deben considerar solo pagos con `estado = completed`.
- Los reembolsos se cuentan con `estado = refunded` o `refunded_at != null`.
- El ticket promedio debe calcularse por moneda.
- Los ingresos deben agruparse por moneda.
- No se debe mostrar un único total mezclando COP y USD.
- La API manejará las monedas de la prueba: COP y USD.
- El summary debe devolver arrays por moneda e incluir COP y/o USD según existan en la DB o en el resultado filtrado.
- Los campos nullable deben manejarse sin romper la respuesta.

## Security

Variables de entorno sugeridas:

```env
PORT=3000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SCHEMA=operations
CORS_ORIGIN=http://localhost:5173
```

Recomendaciones:

- No usar `service_role` en el frontend.
- Preferir `anon key` con políticas RLS de solo lectura si el dashboard será público o semipúblico.
- Si se usa `service_role`, debe quedar exclusivamente en backend y nunca exponerse al navegador.
- Validar y limitar `pageSize` para evitar respuestas demasiado grandes.
- Sanitizar parámetros de búsqueda y ordenamiento usando allowlists.

## Steps

- [x] Crear proyecto backend TypeScript dentro de `basic-api/`.
- [x] Configurar Express + TSOA.
- [x] Configurar cliente de Supabase con variables de entorno.
- [x] Crear entidad `Payment` en `src/entities/Payment.ts` compatible con `operations.payments`.
- [x] Crear `src/gateway/supabase/Basic.ts` para configurar Supabase.
- [x] Crear `src/gateway/Payment.ts` con consultas SQL/PostgREST, sin ORM.
- [x] Implementar filtros, búsqueda, paginación y ordenamiento desde el gateway de pagos.
- [x] Implementar interactores por función en `src/interactors/payment/`, especialmente `GetPaymentsSummaryInteractor.ts` con KPIs agrupados por COP y USD.
- [x] Implementar endpoints de gráficos aprobados: pagos por estado y evolución temporal.
- [x] Implementar exportación CSV respetando filtros.
- [x] Añadir middleware de errores.
- [x] Añadir documentación OpenAPI generada por TSOA.
- [x] Documentar ejecución local en README.

## Verification

### Local

- Ejecutar backend en local.
- Probar `GET /health`.
- Probar `GET /payments` sin filtros.
- Probar filtros por `status`, `currency`, `course`, `from` y `until`.
- Probar búsqueda por `id_pago`, `email`, `nombre` y `curso`.
- Probar `GET /payments/summary` y confirmar que devuelve COP y USD separados si ambas monedas existen en la DB.
- Probar endpoints de gráficos aprobados: `GET /payments/charts/status` y `GET /payments/charts/revenue-timeline`.
- Confirmar que no se implementa `GET /payments/charts/revenue-by-currency`; ese desglose queda incluido en `GET /payments/summary`.
- Probar exportación CSV.

### Datos esperados con evidencia actual

Usando la evidencia del proyecto anterior, la API debería reflejar:

```text
Total filas: 5
Completed: 4
Refunded: 1
Failed guardados: 0
```

Ingresos completed esperados en COP:

```text
PAY-001 120000
PAY-005 90000
PAY-006 75000
PAY-007 120000
Total COP completed = 405000
```

Ticket promedio completed COP:

```text
405000 / 4 = 101250
```

## Deployment

Backend recomendado:

- Vercel Serverless Functions, Render, Railway o Fly.io.

Frontend recomendado:

- Cloudflare Pages o Vercel.

Para una prueba técnica simple, también se puede omitir backend propio y consultar Supabase directamente desde el frontend con `anon key`; sin embargo, la arquitectura con backend es más defendible si se quiere centralizar reglas de negocio, validación, CSV y documentación OpenAPI.
