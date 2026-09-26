import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ApiError } from 'src/exceptions/api-error.exception';
import { handlePrismaError } from 'src/exceptions/prisma-error.exception';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // TODO: вбудовані HttpException Nest (напр. 404 для неіснуючого роута) зараз падають у 500 —
    // перевіряти instanceof HttpException замість ApiError (ApiError — його підклас)
    const error =
      exception instanceof ApiError ? exception : handlePrismaError(exception);

    if (error) {
      return res.status(error.getStatus()).json(error.getResponse());
    }

    console.error(`[${req.method}] ${req.originalUrl}`, exception);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal Server Error' });
  }
}
