# Logali Payments API

Backend API creado para la **Prueba 2** del reto técnico. Lee los pagos almacenados en Supabase/PostgreSQL y expone la información que necesita el dashboard de pagos.

En este proyecto decidí separar la solución en dos partes:

- **API backend**: se conecta a Supabase y expone endpoints seguros de lectura.
- **Frontend**: consume esta API y muestra el dashboard de pagos.

Esta arquitectura evita que el navegador tenga acceso directo a credenciales sensibles de Supabase y centraliza en el backend la lógica de filtros, métricas, paginación y exportación.

## URLs desplegadas

URL base de la API:

```txt
https://api-logali.alejotamayo.com/
```

Documentación:

```txt
https://api-logali.alejotamayo.com/docs
```

Dashboard frontend:

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

## Cache en edge de Cloudflare

La API de producción está detrás de Cloudflare. Para reducir lecturas repetidas hacia el backend y Supabase, configuré cache en el edge únicamente para rutas seguras de lectura usadas por el dashboard:

- `GET /payments`
- `GET /payments/summary`

No se cachean las siguientes rutas:

- `GET /payments/export.csv`
- `GET /health`
- `GET /docs`
- `GET /openapi.json`

Así se mantienen rápidas las lecturas de pagos, sin cachear exportaciones, health checks, documentación ni rutas que puedan volverse sensibles.

## Stack técnico

- Node.js
- TypeScript
- Express
- TSOA para generación de rutas y OpenAPI
- PostgreSQL/Supabase mediante `pg`
- Swagger UI
- Docker y Docker Compose
- Configuración de despliegue con Kamal

## Configuración local de ejecución

Crea un archivo `.env` local antes de ejecutar endpoints que acceden a la base de datos:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
SUPABASE_CONNECTION_STRING=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Configuración usada por la aplicación:

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de la API. Usa `3000` por defecto si no se define. |
| `CORS_ORIGIN` | Orígenes permitidos para el navegador. Usa una lista separada por comas para múltiples orígenes. Si se omite o se define como `*`, CORS permite todos los orígenes. |
| `SUPABASE_CONNECTION_STRING` | Cadena de conexión PostgreSQL/Supabase usada por el pool de `pg`. Es obligatoria para los endpoints respaldados por base de datos. |

## Supuestos de base de datos

La API espera una base de datos compatible con PostgreSQL con esta tabla:

```txt
operations.payments
```

Columnas esperadas:

| Columna | Uso esperado |
| --- | --- |
| `id_pago` | Identificador del pago y clave de unión para la consulta de paginación. |
| `email` | Email del cliente/estudiante. |
| `nombre` | Nombre del cliente/estudiante. Puede ser null. |
| `curso` | Nombre del curso. |
| `importe` | Importe del pago. |
| `moneda` | Código de moneda almacenado en el registro del pago. La API soporta valores dinámicos. |
| `estado` | Estado del pago. Valores esperados: `completed`, `refunded`. |
| `fecha` | Fecha/hora del pago. |
| `refunded_at` | Fecha/hora del reembolso. Puede ser null. |

## Infraestructura

### Docker

El `Dockerfile` usa un build multi-stage:

1. Etapa `builder` basada en `node:22-alpine`
   - instala dependencias con `npm ci`
   - copia TypeScript, configuración de TSOA, código fuente y documentación
   - ejecuta `npm run generate-docs`
   - ejecuta `npm run build`
2. Etapa `production` basada en `node:22-alpine`
   - instala dependencias de producción con `npm ci --omit=dev`
   - copia `dist/` y `docs/`
   - ejecuta el proceso como usuario `node`
   - expone el puerto `3000`
   - inicia con `node dist/server.js`

### Docker Compose

`docker-compose-server.yml` define:

- servicio: `back-logali`
- contenedor: `back-logali`
- nombre de imagen/build: `back-logali`
- target de build: `production`
- mapeo de puertos: `3000:3000`
- archivo de entorno: `.env`
- política de reinicio: `unless-stopped`

### Despliegue con Kamal

`config/deploy.yml` configura el despliegue con Kamal:

- servicio: `back-logali`
- imagen: `alejotamayo28/back-logali`
- registry server: `ghcr.io`
- servidor objetivo: `home-server` (servidor local)
- proxy host: `api-logali.alejotamayo.com` (vía Cloudflare Tunnel)
- puerto de la app: `3000`
- ruta de health check: `/health`
- arquitectura de build: `amd64`
- variables clear de producción: `PORT=3000`, `NODE_ENV=production`
- nombres de variables secretas de producción: `SUPABASE_CONNECTION_STRING`, `CORS_ORIGIN`

## Arquitectura

```mermaid
flowchart TD
    A[Desarrollador] -->|Hace push de código a| B(GitHub)
    B -->|Construye y publica la imagen| C[ghcr.io]
    C -->|Kamal descarga y despliega| D[Servidor local]
    D -->|Ejecuta| E[kamal-proxy / Traefik]
    D -->|Ejecuta| F[basic-api container]
    E -->|Enruta tráfico hacia| F
    F -->|Vía Cloudflare Tunnel| G[api-logali.alejotamayo.com]
    F -->|Se conecta a| H[Supabase / PostgreSQL]
```

## Mejoras posibles

- **Base de datos local para pruebas:** agregar un servicio local de PostgreSQL en Docker Compose con datos semilla.
- **Pruebas automatizadas:** agregar pruebas de integración para filtros, ordenamiento, paginación, cálculos de resumen y exportación CSV usando la base de datos local de pruebas.

## Limitaciones y notas conocidas

- La exportación CSV solicita actualmente hasta `100000` filas.
- La API no implementa autenticación ni autorización; para este reto expone únicamente las lecturas necesarias para el dashboard.
- La API no implementa rate limiting; sería una mejora recomendable para un entorno con mayor tráfico.
