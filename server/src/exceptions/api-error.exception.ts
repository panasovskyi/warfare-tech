import { HttpException, HttpStatus } from '@nestjs/common';
import z, { ZodError } from 'zod';

type Constructor = {
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export class ApiError extends HttpException {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];

  constructor({
    message,
    statusCode,
    fieldErrors = {},
    formErrors = [],
  }: Constructor) {
    super({ message, fieldErrors, formErrors }, statusCode);
    this.formErrors = formErrors;
    this.fieldErrors = fieldErrors;
  }

  static validationError(error: ZodError) {
    const { fieldErrors, formErrors } = z.flattenError(error);

    return new ApiError({
      message: 'Validation error',
      statusCode: HttpStatus.BAD_REQUEST,
      fieldErrors,
      formErrors,
    });
  }

  static fieldErrors({ field, message }: { field: string; message: string }) {
    return new ApiError({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      fieldErrors: { [field]: [message] },
    });
  }

  static formErrors(message: string) {
    return new ApiError({
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      formErrors: [message],
    });
  }

  static badRequest(message = 'Bad Request') {
    return new ApiError({ message, statusCode: HttpStatus.BAD_REQUEST });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError({ message, statusCode: HttpStatus.UNAUTHORIZED });
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError({ message, statusCode: HttpStatus.FORBIDDEN });
  }

  static notFound(message = 'Not Found') {
    return new ApiError({ message, statusCode: HttpStatus.NOT_FOUND });
  }
}
