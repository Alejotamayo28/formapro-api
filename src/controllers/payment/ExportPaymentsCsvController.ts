import { Controller, Get, Produces, Query, Route, Tags } from 'tsoa';
import { PaymentCurrency, PaymentStatus } from '../../entities/Payment';
import { ExportPaymentsCsvInteractor } from '../../interactors/payment/ExportPaymentsCsvInteractor';

@Route('payments')
@Tags('Payments')
export class ExportPaymentsCsvController extends Controller {
  @Get('export.csv')
  @Produces('text/csv')
  public async exportPaymentsCsv(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string
  ): Promise<string> {
    const csv = await ExportPaymentsCsvInteractor({
      status,
      currency,
      course,
    });

    this.setHeader('Content-Type', 'text/csv; charset=utf-8');
    this.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

    return csv;
  }
}
