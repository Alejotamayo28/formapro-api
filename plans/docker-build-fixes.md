# Plan: Fix Docker build and compose production target

## Context

`docker-compose-server.yml` currently builds the `production` target, but the `Dockerfile` does not define a `production` stage. The `Dockerfile` also copies artifacts from a non-existent `builder` stage and runs `npm ci --omit=dev` in the runtime stage before copying `package.json` / `package-lock.json`. These issues will cause Docker builds to fail before the API can run in a container.

## Approach

Make the Dockerfile stage names consistent with the compose file and ensure the runtime image has the required package manifests before installing production dependencies. Keep the multi-stage build pattern: one builder stage with dev dependencies for TSOA/doc generation and TypeScript compilation, and one production stage with only production dependencies plus compiled output.

Recommended stage naming:

- `builder`: installs all dependencies, generates docs/routes, compiles TypeScript.
- `production`: installs production-only dependencies, copies `dist` and `docs` from `builder`, runs `node dist/server.js`.

Keep `docker-compose-server.yml` using `target: production` once the Dockerfile exposes that stage.

## Files to modify

- `Dockerfile`
- `docker-compose-server.yml` only if a compose-level adjustment is desired after verification; the current `target: production` can remain once the Dockerfile is fixed.

## Reuse

- Existing npm scripts in `package.json`:
  - `npm run generate-docs` runs `tsoa spec-and-routes`.
  - `npm run build` runs `tsc` and outputs to `dist`.
  - `npm start` / container command runs `node dist/server.js`.
- Existing app behavior:
  - `src/server.ts` reads `PORT` with fallback `3000`.
  - `src/app.ts` serves docs from `docs/openapi.json` or `docs/swagger.json`, so copying generated `docs` into the production image is required.

## Steps

- [ ] Replace the current `Dockerfile` content with this corrected multi-stage build:

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsoa.json ./
COPY src ./src
COPY docs ./docs

RUN npm run generate-docs
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/docs ./docs

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

- [ ] Keep `docker-compose-server.yml` as-is, because it will be valid once the Dockerfile has a `production` stage:

```yaml
services:
  back-logali:
    build:
      context: .
      target: production
    container_name: back-logali
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

- [ ] Confirm the following code-level fixes are present:
  - `FROM node:22-alpine AS builder` defines the stage used by `COPY --from=builder`.
  - `FROM node:22-alpine AS production` defines the target used by `docker-compose-server.yml`.
  - `COPY package*.json ./` appears before `RUN npm ci --omit=dev` in the production stage.
  - `COPY --from=builder ... /app/dist ./dist` copies compiled JavaScript into the final image.
  - `COPY --from=builder ... /app/docs ./docs` copies generated OpenAPI docs into the final image.
  - `CMD ["node", "dist/server.js"]` keeps the container entrypoint aligned with `package.json`.

## Verification

- [ ] Run `docker compose -f docker-compose-server.yml build` and confirm the image builds successfully.
- [ ] Run `docker compose -f docker-compose-server.yml up` and confirm the container starts.
- [ ] Visit `http://localhost:3000/docs` and confirm Swagger UI loads.
- [ ] Visit `http://localhost:3000/openapi.json` and confirm the generated OpenAPI document is served.
- [ ] Check container logs for `Payments dashboard API listening on http://localhost:3000`.
