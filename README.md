# Basic API — Dashboard de Pagos

Backend TypeScript + Express + TSOA para consultar pagos del dashboard desde Supabase.

## Arquitectura

```text
Frontend React/Vite
  ↓ HTTP
Backend API TypeScript + TSOA
  ↓ Supabase JS / PostgREST
Supabase operations.payments
```

La API es de solo lectura: no crea, actualiza ni elimina pagos. Centraliza filtros, búsqueda, KPIs, gráficos y exportación CSV.

## Requisitos

- Node.js 20+
- npm
- Proyecto Supabase con la tabla `operations.payments`

## Variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SCHEMA=operations
CORS_ORIGIN=http://localhost:5173
```

> No expongas `service_role` en el frontend. Si usas `service_role`, debe quedar solo en backend.

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

La API queda en:

```text
http://localhost:3000
```

Documentación Swagger/OpenAPI:

```text
http://localhost:3000/docs
http://localhost:3000/openapi.json
```

## Build y producción

```bash
npm run build
npm start
```

## Endpoints

### Health

```http
GET /health
```

### Pagos

```http
GET /payments
```

Query params:

```text
status=completed|failed|refunded
currency=COP|USD
course=Excel Avanzado
page=1
pageSize=25
sortBy=fecha
sortOrder=desc
```

### Summary / KPIs

```http
GET /payments/summary
```

Devuelve KPIs separados por COP y USD, sin mezclar monedas:

- Total de pagos.
- Total de reembolsos.
- Ingresos `completed` por moneda.
- Ticket promedio `completed` por moneda.

### Gráficos

```http
GET /payments/charts/status
GET /payments/charts/revenue-timeline
```

No se implementa `/payments/charts/revenue-by-currency`; ese desglose está en `/payments/summary`.

### CSV

```http
GET /payments/export.csv
```

Respeta los mismos filtros de `/payments`.

## Estructura

```text
src/
├── controllers/
│   ├── health.ts
│   └── payment/*Controller.ts
├── interactors/payment/*Interactor.ts
├── entities/Payment.ts
├── gateway/
│   ├── Payment.ts
│   └── supabase/Basic.ts
├── middleware/errorHandler.ts
└── utils/
```
