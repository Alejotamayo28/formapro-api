import { Controller, Get, Query, Route, Tags } from 'tsoa';
import {
  PaymentCurrency,
  PaymentStatus,
  TimelineChartItem,
  TimelineGranularity,
} from '../../entities/Payment';
import { GetPaymentsTimelineInteractor } from '../../interactors/payment/GetPaymentsTimelineInteractor';

@Route('payments/charts')
@Tags('Payments Charts')
export class GetPaymentsTimelineController extends Controller {
  @Get('revenue-timeline')
  public async getPaymentsTimeline(
    @Query() granularity?: TimelineGranularity,
    @Query() currency?: PaymentCurrency,
    @Query() status?: PaymentStatus,
    @Query() course?: string
  ): Promise<TimelineChartItem[]> {
    return GetPaymentsTimelineInteractor({
      granularity,
      currency,
      status,
      course,
    });
  }
}
