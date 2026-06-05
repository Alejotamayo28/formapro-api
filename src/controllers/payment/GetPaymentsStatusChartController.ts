import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { PaymentCurrency, PaymentStatus, StatusChartItem } from '../../entities/Payment';
import { GetPaymentsStatusChartInteractor } from '../../interactors/payment/GetPaymentsStatusChartInteractor';

@Route('payments/charts')
@Tags('Payments Charts')
export class GetPaymentsStatusChartController extends Controller {
  @Get('status')
  public async getPaymentsStatusChart(
    @Query() status?: PaymentStatus,
    @Query() currency?: PaymentCurrency,
    @Query() course?: string
  ): Promise<StatusChartItem[]> {
    return GetPaymentsStatusChartInteractor({
      status,
      currency,
      course,
    });
  }
}
