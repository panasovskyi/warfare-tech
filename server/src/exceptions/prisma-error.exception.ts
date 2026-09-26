import { Prisma } from 'generated/prisma/client';
import { ApiError } from './api-error.exception';

export const handlePrismaError = (error: unknown): ApiError | null => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[])?.join(', ') ?? 'Field';
      return ApiError.formErrors(`${target} already exists`);
    }
    case 'P2025':
      return ApiError.notFound('Record not found');
    default:
      return null;
  }
};
