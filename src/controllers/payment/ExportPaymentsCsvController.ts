import { Controller, Get, Produces, Query, Route, Tags } from 'tsoa';
import { PaymentCurrency, PaymentStatus } from '../../entities/Payment';
import { PaymentFilters } from '../../gateway/Payment';
import { ExportPaymentsCsvInteractor } from '../../interactors/payment/ExportPaymentsCsvInteractor';
import { Readable } from 'node:stream';

@Route('payments')
@Tags('Payments')
export class ExportPaymentsCsvController extends Controller {
  @Get('export.csv')
  @Produces('text/csv')
  public async exportPaymentsCsv(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string,
    @Query() name?: string,
    @Query() email?: string
  ): Promise<Readable> {
    const paymentFilters: PaymentFilters = {
      status,
      currency,
      course,
      name,
      email,
    };

    const csv = await ExportPaymentsCsvInteractor(paymentFilters);

    this.setHeader('Content-Type', 'text/csv; charset=utf-8');
    this.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

    return Readable.from([csv]);
  }
}
