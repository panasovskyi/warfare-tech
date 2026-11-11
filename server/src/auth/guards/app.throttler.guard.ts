import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ApiError } from 'src/exceptions/api-error.exception';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const message = await this.getErrorMessage(context, throttlerLimitDetail);

    throw ApiError.tooManyRequests(message);
  }
}
