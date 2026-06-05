import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { PaymentCurrency, PaymentStatus, PaymentsSummary } from '../../entities/Payment';
import { GetPaymentsSummaryInteractor } from '../../interactors/payment/GetPaymentsSummaryInteractor';

@Route('payments')
@Tags('Payments')
export class GetPaymentsSummaryController extends Controller {
  @Get('summary')
  public async getPaymentsSummary(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string
  ): Promise<PaymentsSummary> {
    return GetPaymentsSummaryInteractor({
      status,
      currency,
      course,
    });
  }
}
