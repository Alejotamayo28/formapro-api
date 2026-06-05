/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './../controllers/health';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { GetPaymentsSummaryController } from './../controllers/payment/GetPaymentsSummaryController';
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
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["cop"]},{"dataType":"enum","enums":["usd"]}],"validators":{}},
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
    "PaymentsSummaryResponse": {
        "dataType": "refObject",
        "properties": {
            "total_payments": {"dataType":"double","required":true},
            "total_refunds": {"dataType":"double","required":true},
            "completed_revenue_by_currency": {"dataType":"array","array":{"dataType":"refObject","ref":"MoneyMetric"},"required":true},
            "average_ticket_by_currency": {"dataType":"array","array":{"dataType":"refObject","ref":"MoneyMetric"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentsResponse": {
        "dataType": "refObject",
        "properties": {
            "pago_id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "nombre": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "curso": {"dataType":"string","required":true},
            "importe": {"dataType":"double","required":true},
            "moneda": {"ref":"PaymentCurrency","required":true},
            "fecha": {"dataType":"datetime","required":true},
            "refunded_at": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentsWithPagesResponse": {
        "dataType": "refObject",
        "properties": {
            "payments": {"dataType":"array","array":{"dataType":"refObject","ref":"PaymentsResponse"},"required":true},
            "number_of_pages": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["failed"]},{"dataType":"enum","enums":["refunded"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentSortBy": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["id_pago"]},{"dataType":"enum","enums":["email"]},{"dataType":"enum","enums":["nombre"]},{"dataType":"enum","enums":["curso"]},{"dataType":"enum","enums":["importe"]},{"dataType":"enum","enums":["moneda"]},{"dataType":"enum","enums":["estado"]},{"dataType":"enum","enums":["fecha"]},{"dataType":"enum","enums":["refunded_at"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentSortOrder": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ASC"]},{"dataType":"enum","enums":["DESC"]}],"validators":{}},
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
        const argsGetPaymentsSummaryController_getPaymentsSummary: Record<string, TsoaRoute.ParameterSchema> = {
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
        const argsGetPaymentsController_getPayments: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"in":"query","name":"status","ref":"PaymentStatus"},
                currency: {"in":"query","name":"currency","ref":"PaymentCurrency"},
                course: {"in":"query","name":"course","dataType":"string"},
                name: {"in":"query","name":"name","dataType":"string"},
                email: {"in":"query","name":"email","dataType":"string"},
                sortBy: {"in":"query","name":"sortBy","ref":"PaymentSortBy"},
                sortOrder: {"in":"query","name":"sortOrder","ref":"PaymentSortOrder"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                offset: {"in":"query","name":"offset","dataType":"double"},
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
                name: {"in":"query","name":"name","dataType":"string"},
                email: {"in":"query","name":"email","dataType":"string"},
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
