/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './../controllers/health';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GetPaymentsTimelineController } from './../controllers/payment/GetPaymentsTimelineController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GetPaymentsSummaryController } from './../controllers/payment/GetPaymentsSummaryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GetPaymentsStatusChartController } from './../controllers/payment/GetPaymentsStatusChartController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GetPaymentsController } from './../controllers/payment/GetPaymentsController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ExportPaymentsCsvController } from './../controllers/payment/ExportPaymentsCsvController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "HealthResponse": {
        "dataType": "refObject",
        "properties": {
            "ok": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentCurrency": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["COP"]},{"dataType":"enum","enums":["USD"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimelineChartItem": {
        "dataType": "refObject",
        "properties": {
            "period": {"dataType":"string","required":true},
            "currency": {"ref":"PaymentCurrency","required":true},
            "amount": {"dataType":"double","required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimelineGranularity": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["day"]},{"dataType":"enum","enums":["week"]},{"dataType":"enum","enums":["month"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]},{"dataType":"enum","enums":["refunded"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CountMetric": {
        "dataType": "refObject",
        "properties": {
            "currency": {"ref":"PaymentCurrency","required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MoneyMetric": {
        "dataType": "refObject",
        "properties": {
            "currency": {"ref":"PaymentCurrency","required":true},
            "amount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentsSummary": {
        "dataType": "refObject",
        "properties": {
            "totalPayments": {"dataType":"double","required":true},
            "totalRefunds": {"dataType":"double","required":true},
            "paymentsByCurrency": {"dataType":"array","array":{"dataType":"refObject","ref":"CountMetric"},"required":true},
            "refundsByCurrency": {"dataType":"array","array":{"dataType":"refObject","ref":"CountMetric"},"required":true},
            "completedRevenueByCurrency": {"dataType":"array","array":{"dataType":"refObject","ref":"MoneyMetric"},"required":true},
            "averageTicketByCurrency": {"dataType":"array","array":{"dataType":"refObject","ref":"MoneyMetric"},"required":true},
            "lastUpdated": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StatusChartItem": {
        "dataType": "refObject",
        "properties": {
            "status": {"ref":"PaymentStatus","required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Payment": {
        "dataType": "refObject",
        "properties": {
            "id_pago": {"dataType":"string","required":true},
            "email": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "nombre": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "curso": {"dataType":"string","required":true},
            "importe": {"dataType":"double","required":true},
            "moneda": {"ref":"PaymentCurrency","required":true},
            "estado": {"ref":"PaymentStatus","required":true},
            "fecha": {"dataType":"string","required":true},
            "refunded_at": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentSortBy": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["id_pago"]},{"dataType":"enum","enums":["email"]},{"dataType":"enum","enums":["nombre"]},{"dataType":"enum","enums":["curso"]},{"dataType":"enum","enums":["importe"]},{"dataType":"enum","enums":["moneda"]},{"dataType":"enum","enums":["estado"]},{"dataType":"enum","enums":["fecha"]},{"dataType":"enum","enums":["refunded_at"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SortOrder": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedPaymentsResponse": {
        "dataType": "refObject",
        "properties": {
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"Payment"},"required":true},
            "pagination": {"dataType":"nestedObjectLiteral","nestedProperties":{"totalPages":{"dataType":"double","required":true},"total":{"dataType":"double","required":true},"pageSize":{"dataType":"double","required":true},"page":{"dataType":"double","required":true}},"required":true},
            "sort": {"dataType":"nestedObjectLiteral","nestedProperties":{"sortOrder":{"ref":"SortOrder","required":true},"sortBy":{"ref":"PaymentSortBy","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsHealthController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/health',
            ...(fetchMiddlewares<RequestHandler>(HealthController)),
            ...(fetchMiddlewares<RequestHandler>(HealthController.prototype.getHealth)),

            async function HealthController_getHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHealthController_getHealth, request, response });

                const controller = new HealthController();

              await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGetPaymentsTimelineController_getPaymentsTimeline: Record<string, TsoaRoute.ParameterSchema> = {
                granularity: {"in":"query","name":"granularity","ref":"TimelineGranularity"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                course: {"in":"query","name":"course","dataType":"string"},
        };
        app.get('/payments/charts/revenue-timeline',
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsTimelineController)),
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsTimelineController.prototype.getPaymentsTimeline)),

            async function GetPaymentsTimelineController_getPaymentsTimeline(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGetPaymentsTimelineController_getPaymentsTimeline, request, response });

                const controller = new GetPaymentsTimelineController();

              await templateService.apiHandler({
                methodName: 'getPaymentsTimeline',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGetPaymentsSummaryController_getPaymentsSummary: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                course: {"in":"query","name":"course","dataType":"string"},
        };
        app.get('/payments/summary',
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsSummaryController)),
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsSummaryController.prototype.getPaymentsSummary)),

            async function GetPaymentsSummaryController_getPaymentsSummary(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGetPaymentsSummaryController_getPaymentsSummary, request, response });

                const controller = new GetPaymentsSummaryController();

              await templateService.apiHandler({
                methodName: 'getPaymentsSummary',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGetPaymentsStatusChartController_getPaymentsStatusChart: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                course: {"in":"query","name":"course","dataType":"string"},
        };
        app.get('/payments/charts/status',
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsStatusChartController)),
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsStatusChartController.prototype.getPaymentsStatusChart)),

            async function GetPaymentsStatusChartController_getPaymentsStatusChart(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGetPaymentsStatusChartController_getPaymentsStatusChart, request, response });

                const controller = new GetPaymentsStatusChartController();

              await templateService.apiHandler({
                methodName: 'getPaymentsStatusChart',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsGetPaymentsController_getPayments: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                course: {"in":"query","name":"course","dataType":"string"},
                page: {"in":"query","name":"page","dataType":"double"},
                pageSize: {"in":"query","name":"pageSize","dataType":"double"},
                sortBy: {"in":"query","name":"sortBy","ref":"PaymentSortBy"},
                sortOrder: {"in":"query","name":"sortOrder","ref":"SortOrder"},
        };
        app.get('/payments',
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsController)),
            ...(fetchMiddlewares<RequestHandler>(GetPaymentsController.prototype.getPayments)),

            async function GetPaymentsController_getPayments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsGetPaymentsController_getPayments, request, response });

                const controller = new GetPaymentsController();

              await templateService.apiHandler({
                methodName: 'getPayments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsExportPaymentsCsvController_exportPaymentsCsv: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                course: {"in":"query","name":"course","dataType":"string"},
        };
        app.get('/payments/export.csv',
            ...(fetchMiddlewares<RequestHandler>(ExportPaymentsCsvController)),
            ...(fetchMiddlewares<RequestHandler>(ExportPaymentsCsvController.prototype.exportPaymentsCsv)),

            async function ExportPaymentsCsvController_exportPaymentsCsv(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsExportPaymentsCsvController_exportPaymentsCsv, request, response });

                const controller = new ExportPaymentsCsvController();

              await templateService.apiHandler({
                methodName: 'exportPaymentsCsv',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
