import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { handlePrismaError } from 'src/exceptions/prisma-error.exception';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const error =
      exception instanceof HttpException
        ? exception
        : handlePrismaError(exception);

    if (error) {
      return res.status(error.getStatus()).json(error.getResponse());
    }

    console.error(`[${req.method}] ${req.originalUrl}`, exception);

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal Server Error' });
  }
}
