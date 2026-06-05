# Containerize Payments Dashboard API

## Context

This repository is a TypeScript Express API for the FormaPro payments dashboard. It uses TSOA-generated routes/OpenAPI docs and connects to Supabase Postgres through `SUPABASE_CONNECTION_STRING`.

The goal is to containerize the API without baking secrets into the image, while keeping the container build reproducible and production-oriented.

Current findings:

- Runtime entrypoint is `dist/server.js` via `npm start`.
- Source entrypoint is `src/server.ts`.
- API defaults to port `3000`.
- `src/server.ts` already reads `PORT` from the environment with fallback to `3000`, which is the preferred container approach because Docker/Kubernetes/cloud runtimes commonly inject or require configurable ports.
- Health endpoint exists at `GET /health` and can be used for Docker health checks.
- OpenAPI docs are served from `docs/swagger.json` or `docs/openapi.json` at `/docs` and `/openapi.json`.
- `.env` exists locally and must not be copied into the Docker image.

## Approach

Use a multi-stage Docker build:

1. Builder stage installs all dependencies with `npm ci`, copies TypeScript source/config/docs, regenerates TSOA docs/routes, and compiles TypeScript.
2. Runtime stage copies only production dependencies, compiled `dist`, and generated `docs`.
3. Runtime configuration is supplied by environment variables, especially `SUPABASE_CONNECTION_STRING`, optional `CORS_ORIGIN`, and optional `PORT`.
4. Add Docker ignore rules so local files such as `.env`, `node_modules`, `dist`, and `.git` are not included in the build context.
5. Reuse the existing `PORT` environment-variable support in `src/server.ts`; no application code change is needed for port configurability.

Recommended base image: `node:22-bookworm-slim`, matching the repo's Node 22 type definitions and providing a stable LTS-compatible runtime.

## Files to modify

- `Dockerfile`
  - Add production multi-stage image build.
- `.dockerignore`
  - Exclude local/generated/secret files from Docker build context.

## Reuse

Existing project behavior/utilities to reuse:

- `package.json`
  - `npm ci` from `package-lock.json` for deterministic installs.
  - `npm run generate-docs` for TSOA route/spec generation.
  - `npm run build` for TypeScript compilation.
  - `npm start` / `node dist/server.js` as runtime command.
- `src/controllers/health.ts`
  - Existing `GET /health` endpoint for container health checks.
- `src/app.ts`
  - Existing Express app factory, CORS env support via `CORS_ORIGIN`, docs loading, route registration, and error handlers.
- `src/gateway/supabase/Basic.ts`
  - Existing `SUPABASE_CONNECTION_STRING` requirement and Postgres pool setup.
- `docs/swagger.json`
  - Existing generated OpenAPI document served by the app.

## Steps

- [ ] Confirm no secret values are committed or copied into Docker images; keep `.env` excluded.
- [ ] Add `.dockerignore` excluding `node_modules`, `dist`, `.git`, `.env`, logs, and OS junk files.
- [ ] Add a multi-stage `Dockerfile`:
  - [ ] Builder stage: `npm ci`, copy config/source/docs, `npm run generate-docs`, `npm run build`, prune dev dependencies.
  - [ ] Runtime stage: copy production `node_modules`, `dist`, `docs`, and package metadata.
  - [ ] Expose port `3000`.
  - [ ] Run `node dist/server.js`.
  - [ ] Add a healthcheck against `/health` if the selected base image includes a suitable tool or if adding one is acceptable.
## Verification

Local verification before building Docker:

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run generate-docs`.
- [ ] Run `npm run build`.
- [ ] Run `npm start` and verify `GET http://localhost:3000/health` returns `{"ok":true}`.

Docker verification:

- [ ] Build image: `docker build -t payments-api .`.
- [ ] Run container with required env: `docker run --rm --env-file .env -p 3000:3000 payments-api`.
- [ ] Verify health: `curl http://localhost:3000/health`.
- [ ] Verify docs: `curl -I http://localhost:3000/docs` or open in browser.
- [ ] Verify DB-backed endpoints using a valid `SUPABASE_CONNECTION_STRING`:
  - [ ] `GET /payments`
  - [ ] `GET /payments/summary`
  - [ ] `GET /payments/export.csv`
- [ ] Confirm container starts when `PORT` is overridden, for example `-e PORT=8080 -p 8080:8080`.
