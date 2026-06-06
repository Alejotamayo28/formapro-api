import { Controller, Get, Query, Route, Tags } from 'tsoa';
import {
  PaymentCurrency,
  PaymentStatus,
} from '../../entities/Payment';
import { PaymentFilters } from '../../gateway/Payment';
import {
  GetPaymentsSummaryInteractor,
  PaymentsSummaryResponse,
} from '../../interactors/payment/GetPaymentsSummaryInteractor';

@Route('payments')
@Tags('Payments')
export class GetPaymentsSummaryController extends Controller {
  @Get('summary')
  public async getPaymentsSummary(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string,
    @Query() name?: string,
    @Query() email?: string,
  ): Promise<PaymentsSummaryResponse> {
    const paymentFilters: PaymentFilters = {
      status,
      currency,
      course,
      name,
      email,
    };

    return GetPaymentsSummaryInteractor(paymentFilters);
  }
}
