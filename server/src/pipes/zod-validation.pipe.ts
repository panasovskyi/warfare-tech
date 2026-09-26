import { PipeTransform } from '@nestjs/common';
import { ApiError } from 'src/exceptions/api-error.exception';
import { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw ApiError.validationError(result.error);
    }

    return result.data;
  }
}
