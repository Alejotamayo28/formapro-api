import { Controller, Get, Query, Route, Tags } from 'tsoa';
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
    @Query() course?: string
  ): Promise<PaymentsSummaryResponse> {
    const paymentFilters: PaymentFilters = {
      course,
    };

    return GetPaymentsSummaryInteractor(paymentFilters);
  }
}
