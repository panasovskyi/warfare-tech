export type ApiErrorBody = {
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly formErrors: string[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = body.fieldErrors ?? {};
    this.formErrors = body.formErrors ?? [];
  }
}

export const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
  typeof data === 'object' &&
  data !== null &&
  'message' in data &&
  typeof data.message === 'string';