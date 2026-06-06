# basic-api

Backend API for the payments dashboard. It exposes health, payments listing, payments summary, and CSV export endpoints for payment records stored in PostgreSQL/Supabase.

## Tech stack

- Node.js
- TypeScript
- Express
- TSOA for route and OpenAPI generation
- PostgreSQL/Supabase via `pg`
- Swagger UI
- Docker and Docker Compose
- Kamal deployment configuration

## Prerequisites

- Node.js 22 or compatible
- npm
- Access to a PostgreSQL/Supabase database
- Docker, optional, for containerized usage

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

## Installation and local development

Install dependencies:

```bash
npm install
```

Generate OpenAPI spec and TSOA routes:

```bash
npm run generate-docs
```

Run the development server:

```bash
npm run dev
```

Type-check the project:

```bash
npm run typecheck
```

Build production JavaScript into `dist/`:

```bash
npm run build
```

Start the built app:

```bash
npm start
```

### Example local workflow

```bash
npm install
npm run generate-docs
npm run dev
```

Then open:

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Health check: `http://localhost:3000/health`

## API documentation

When `docs/swagger.json` or `docs/openapi.json` exists, the app serves:

- `GET /docs` — Swagger UI
- `GET /openapi.json` — raw OpenAPI document

Configured OpenAPI servers:

- Local: `http://localhost:3000`
- Production: `https://api-logali.alejotamayo.com`

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
| `moneda` | Currency. Expected values: `cop`, `usd`. |
| `estado` | Payment status. Expected values: `completed`, `refunded`. |
| `fecha` | Payment date/time. |
| `refunded_at` | Refund date/time. Can be null. |


## Infrastructure

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
- web server target: `home-server`
- proxy host: `api-logali.alejotamayo.com`
- app port: `3000`
- healthcheck path: `/health`
- build architecture: `amd64`
- production clear env: `PORT=3000`, `NODE_ENV=production`
- production secret env names: `SUPABASE_CONNECTION_STRING`, `CORS_ORIGIN`

## Possible improvements

- **Cache repeated reads:** Add caching for expensive read endpoints
- **Local database for testing:** Add a local PostgreSQL service in Docker Compose with seed data.
- **Automated tests:** Add integration tests for filters, sorting, pagination, summary calculations, and CSV export using the local test database.

## Known limitations and notes

- Summary and CSV export currently request up to `1000` rows.
- No authentication or autherization
