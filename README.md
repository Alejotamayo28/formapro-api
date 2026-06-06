# Logali Payments API

Backend API creado para la **Prueba 2** del reto técnico. Lee los pagos almacenados en Supabase/PostgreSQL y expone la información que necesita el dashboard de pagos.

En este proyecto decidí separar la solución en dos partes:

- **API**: se conecta a Supabase y expone endpoints seguros de lectura.
- **Frontend**: consume esta API y muestra el dashboard de pagos.

De esta forma, el navegador nunca necesita acceder a claves sensibles de Supabase.

## URLs desplegadas

API base URL:

```txt
https://api-logali.alejotamayo.com/
```

Documentación:

```txt
https://api-logali.alejotamayo.com/docs
```

Frontend dashboard:

```txt
https://ui-logali.alejotamayo.com/
```

## Qué expone la API

La API incluye los endpoints necesarios para el dashboard:

- **Health check** para validar disponibilidad del backend.
- **Listado de pagos** con paginación, filtros y ordenamiento.
- **Resumen de pagos** con métricas principales.
- **Ingresos completados por moneda**.
- **Ticket promedio por moneda**.
- **Exportación CSV** de pagos filtrados.
- **Documentación OpenAPI/Swagger**.

## Seguridad

Las credenciales de Supabase se usan únicamente en el backend mediante variables de entorno.

La `service_role key` o cualquier credencial sensible **no está expuesta en el navegador ni está hardcodeada en el repositorio**.

Variable sensible principal:

```env
SUPABASE_CONNECTION_STRING=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

## Cloudflare edge cache

La API de producción está detrás de Cloudflare. Para reducir lecturas repetidas hacia el backend y Supabase, configuré cache en el edge únicamente para rutas seguras de lectura usadas por el dashboard:

- `GET /payments`
- `GET /payments/summary`

No se cachean rutas como exportación CSV, health checks, documentación ni endpoints que puedan volverse sensibles.

## Tech stack

- Node.js
- TypeScript
- Express
- TSOA for route and OpenAPI generation
- PostgreSQL/Supabase via `pg`
- Swagger UI
- Docker and Docker Compose
- Kamal deployment configuration

## Local runtime configuration

Create a local `.env` file before running endpoints that access the database:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
SUPABASE_CONNECTION_STRING=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Configuration used by the app:

| Variable | Description |
| --- | --- |
| `PORT` | API port. Defaults to `3000` if not set. |
| `CORS_ORIGIN` | Allowed browser origins. Use a comma-separated list for multiple origins. If omitted or set to `*`, CORS allows all origins. |
| `SUPABASE_CONNECTION_STRING` | PostgreSQL/Supabase connection string used by the `pg` pool. Required for database-backed endpoints. |

## Database assumptions

The API expects a PostgreSQL-compatible database with this table:

```txt
operations.payments
```

Expected columns:

| Column | Expected usage |
| --- | --- |
| `id_pago` | Payment identifier and join key for pagination query. |
| `email` | Customer/student email. |
| `nombre` | Customer/student name. Can be null. |
| `curso` | Course name. |
| `importe` | Payment amount. |
| `moneda` | Currency code stored in the payment record. Dynamic values are supported by the API. |
| `estado` | Payment status. Expected values: `completed`, `refunded`. |
| `fecha` | Payment date/time. |
| `refunded_at` | Refund date/time. Can be null. |


## Infrastructure

### Cloudflare edge cache

The production API is behind Cloudflare, and repeated read requests are cached at the edge to reduce backend and Supabase load.

Only safe `GET` dashboard endpoints are cached:

- `GET /payments`
- `GET /payments/summary`

The following routes are not cached:

- `GET /payments/export.csv`
- `GET /health`
- `GET /docs`
- `GET /openapi.json`

This keeps payment reads fast while avoiding cache for exports, health checks, documentation and any route that could become sensitive.

### Docker

The `Dockerfile` uses a multi-stage build:

1. `builder` stage on `node:22-alpine`
   - installs dependencies with `npm ci`
   - copies TypeScript, TSOA config, source, and docs
   - runs `npm run generate-docs`
   - runs `npm run build`
2. `production` stage on `node:22-alpine`
   - installs production dependencies with `npm ci --omit=dev`
   - copies `dist/` and `docs/`
   - runs as the `node` user
   - exposes port `3000`
   - starts with `node dist/server.js`


### Docker Compose

`docker-compose-server.yml` defines:

- service: `back-logali`
- container: `back-logali`
- image/build name: `back-logali`
- build target: `production`
- port mapping: `3000:3000`
- env file: `.env`
- restart policy: `unless-stopped`

### Kamal deployment

`config/deploy.yml` configures Kamal deployment with:

- service: `back-logali`
- image: `alejotamayo28/back-logali`
- registry server: `ghcr.io`
- web server target: `home-server` (your local server)
- proxy host: `api-logali.alejotamayo.com` (via Cloudflare Tunnel)
- app port: `3000`
- healthcheck path: `/health`
- build architecture: `amd64`
- production clear env: `PORT=3000`, `NODE_ENV=production`
- production secret env names: `SUPABASE_CONNECTION_STRING`, `CORS_ORIGIN`

## Architecture

```mermaid
flowchart TD
    A[Developer] -->|Pushes code to| B(GitHub)
    B -->|Builds and pushes image| C[ghcr.io]
    C -->|Kamal pulls and deploys| D[Home server]
    D -->|Runs| E[kamal-proxy / Traefik]
    D -->|Runs| F[basic-api container]
    E -->|Routes traffic to| F
    F -->|Via Cloudflare Tunnel| G[api-logali.alejotamayo.com]
    F -->|Connects to| H[Supabase / PostgreSQL]
```

## Possible improvements

- **Local database for testing:** Add a local PostgreSQL service in Docker Compose with seed data.
- **Automated tests:** Add integration tests for filters, sorting, pagination, summary calculations, and CSV export using the local test database.

## Known limitations and notes

- CSV export currently requests up to `100000` rows.
- No authentication or autherization
