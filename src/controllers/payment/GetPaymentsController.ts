import { Controller, Get, Query, Route, Tags } from 'tsoa';
import {
  PaymentCurrency,
  PaymentStatus,
} from '../../entities/Payment';
import { GetPaymentsInteractor, PaymentsWithPagesResponse } from '../../interactors/payment/GetPaymentsInteractor';
import { PaymentFilters, PaymentSortBy, PaymentSortOrder } from '../../gateway/Payment';

@Route('payments')
@Tags('Payments')
export class GetPaymentsController extends Controller {
  @Get('/')
  public async getPayments(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string,
    @Query() name?: string,
    @Query() email?: string,
    @Query() sortBy?: PaymentSortBy,
    @Query() sortOrder?: PaymentSortOrder,
    @Query() limit?: number,
    @Query() offset?: number,
  ): Promise<PaymentsWithPagesResponse> {
    const paymentFilters: PaymentFilters = {
      status,
      currency,
      course,
      name,
      email
    }

    return GetPaymentsInteractor(
      paymentFilters,
      sortOrder,
      sortBy,
      limit,
      offset,
    );
  }
}
