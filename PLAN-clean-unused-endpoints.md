# Plan — Clean unused payment endpoints

## Context

The dashboard MVP should expose only these payment endpoints for now:

```http
GET /payments
GET /payments/summary
GET /payments/charts/status
GET /payments/export.csv
```

The current codebase also contains the revenue timeline endpoint and related code:

```http
GET /payments/charts/revenue-timeline
```

There are also generated TSOA/OpenAPI files that still reference this endpoint. Removing the unused endpoint will reduce scope and make the backend easier to stabilize before fixing the remaining type/gateway issues.

`GET /health` should be kept because it is useful for local checks and deployment health checks, even though it is not a dashboard payment endpoint.

## Approach

Remove the unused revenue timeline feature end-to-end, including controller, interactor, date utility, related entity types, generated routes references, and OpenAPI documentation references.

Then align the remaining code around only the active MVP endpoints. Do not introduce new chart features while cleaning this up.

Important: after code cleanup, TSOA routes/docs should be regenerated in a normal implementation pass with `npm run generate`. Per the current instruction, this plan does not run build/typecheck/checktypes.

## Files to modify

Critical files to change:

```text
src/controllers/payment/GetPaymentsTimelineController.ts
src/interactors/payment/GetPaymentsTimelineInteractor.ts
src/utils/dates.ts
src/entities/Payment.ts
src/interactors/payment/shared.ts
src/routes/routes.ts
src/app.ts
README.md
docs/swagger.json
```

Expected deletion candidates:

```text
src/controllers/payment/GetPaymentsTimelineController.ts
src/interactors/payment/GetPaymentsTimelineInteractor.ts
src/utils/dates.ts
```

Generated/derived files to update after regeneration:

```text
src/routes/routes.ts
docs/swagger.json
```

## Reuse

Keep and reuse the existing MVP endpoint structure:

- `src/controllers/payment/GetPaymentsController.ts`
- `src/controllers/payment/GetPaymentsSummaryController.ts`
- `src/controllers/payment/GetPaymentsStatusChartController.ts`
- `src/controllers/payment/ExportPaymentsCsvController.ts`
- `src/controllers/health.ts`
- `src/interactors/payment/GetPaymentsInteractor.ts`
- `src/interactors/payment/GetPaymentsSummaryInteractor.ts`
- `src/interactors/payment/GetPaymentsStatusChartInteractor.ts`
- `src/interactors/payment/ExportPaymentsCsvInteractor.ts`
- `src/utils/csv.ts`
- `src/middleware/errorHandler.ts`

Keep shared normalization only for the remaining concepts:

- `PaymentStatus`
- `PaymentCurrency`
- payment filters used by `/payments`, `/payments/summary`, `/payments/charts/status`, and `/payments/export.csv`

## Steps

- [ ] Delete or remove `GetPaymentsTimelineController.ts` from active source.
- [ ] Delete or remove `GetPaymentsTimelineInteractor.ts` from active source.
- [ ] Delete `src/utils/dates.ts` if it is only used by the removed timeline feature.
- [ ] Remove `TimelineGranularity` and `TimelineChartItem` types from `src/entities/Payment.ts` once no remaining code needs them.
- [ ] Remove `normalizeGranularity` from `src/interactors/payment/shared.ts`.
- [ ] Ensure no imports reference the removed timeline controller/interactor/date utility.
- [ ] Regenerate TSOA routes/docs so `src/routes/routes.ts` and `docs/swagger.json` no longer expose `/payments/charts/revenue-timeline`.
- [ ] Update `README.md` endpoint list to document only:
  - [ ] `GET /health`
  - [ ] `GET /payments`
  - [ ] `GET /payments/summary`
  - [ ] `GET /payments/charts/status`
  - [ ] `GET /payments/export.csv`
- [ ] Keep `/docs` and `/openapi.json` support in `src/app.ts`; only remove the unused payment endpoint from generated docs/routes.
- [ ] After cleanup, continue with the separate bug-fix pass for missing shared types, `findAllPayments`, env variable consistency, pagination contract, and currency casing.

## Verification

Do not run `typecheck`, `checktypes`, or `build` for this codebase right now.

Recommended verification for the implementation pass:

- Inspect source search results and confirm there are no references to:
  - `GetPaymentsTimelineController`
  - `GetPaymentsTimelineInteractor`
  - `TimelineGranularity`
  - `TimelineChartItem`
  - `getTimelinePeriod`
  - `/payments/charts/revenue-timeline`
- Inspect `src/routes/routes.ts` and confirm only these active HTTP routes remain:
  - `/health`
  - `/payments`
  - `/payments/summary`
  - `/payments/charts/status`
  - `/payments/export.csv`
- Inspect `docs/swagger.json` and confirm `/payments/charts/revenue-timeline` is absent.
- Start the server only after the known blocking bugs are fixed, then manually check:
  - `GET /health`
  - `GET /payments`
  - `GET /payments/summary`
  - `GET /payments/charts/status`
  - `GET /payments/export.csv`
