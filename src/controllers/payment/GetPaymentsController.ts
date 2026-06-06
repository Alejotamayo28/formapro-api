import { Controller, Get, Query, Route, Tags, ValidateError } from 'tsoa';
import {
  PaymentStatus,
} from '../../entities/Payment';
import { GetPaymentsInteractor, PaymentsWithPagesResponse } from '../../interactors/payment/GetPaymentsInteractor';
import { PaymentFilters, PaymentSortBy, PaymentSortOrder } from '../../gateway/Payment';

export const DEFAULT_PAYMENTS_LIMIT = 10;
export const DEFAULT_PAYMENTS_OFFSET = 0;

export const MAX_PAYMENTS_LIMIT = 1000;
const MAX_PAYMENTS_OFFSET = 1000;

interface PaymentPagination {
  limit: number;
  offset: number;
}

const validatePagination = (limit?: number, offset?: number): PaymentPagination => {
  const normalizedLimit = limit ?? DEFAULT_PAYMENTS_LIMIT;
  const normalizedOffset = offset ?? DEFAULT_PAYMENTS_OFFSET;

  if (normalizedLimit < 1 || normalizedLimit > MAX_PAYMENTS_LIMIT)
    throw new ValidateError({
      limit: {
        message: `Must be between 1 and ${MAX_PAYMENTS_LIMIT}`, value: limit
      }
    }, "Invalid pagination parameters")

  if (normalizedOffset < 0 || normalizedOffset > MAX_PAYMENTS_OFFSET)
    throw new ValidateError({
      offset: {
        message: `Must be between 0 and ${MAX_PAYMENTS_OFFSET}`, value: offset
      }
    }, "Invalid pagination parameters")

  return {
    limit: normalizedLimit,
    offset: normalizedOffset,
  };
};

@Route('payments')
@Tags('Payments')
export class GetPaymentsController extends Controller {
  @Get('/')
  public async getPayments(
    @Query() status?: PaymentStatus,
    @Query() currency?: string,
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
    const pagination = validatePagination(limit, offset);

    return GetPaymentsInteractor(
      paymentFilters,
      sortOrder,
      sortBy,
      pagination.limit,
      pagination.offset,
    );
  }
}
