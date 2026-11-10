import axios from 'axios';

// Помилка публікації з готовим для людини повідомленням
export class PublishingError extends Error {}

// Форма тіла помилки сервера
type ServerErrorBody = {
  message?: unknown;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

// Витягує з тіла відповіді всі пояснення: загальне повідомлення, помилки форми й окремих полів
const readDetails = (data: unknown): string[] => {
  if (typeof data !== 'object' || data === null) {
    return [];
  }

  const { message, fieldErrors, formErrors } = data as ServerErrorBody;

  const details = [
    ...(typeof message === 'string' ? [message] : []),
    ...(formErrors ?? []),
    ...Object.entries(fieldErrors ?? {}).flatMap(([field, messages]) =>
      messages.map((fieldMessage) => `${field}: ${fieldMessage}`),
    ),
  ];

  return [...new Set(details)];
};

// Сервер відповідає у формі { message, fieldErrors, formErrors }: показуємо все
export const toPublishingError = (
  error: unknown,
  action: string,
): PublishingError => {
  if (!axios.isAxiosError(error)) {
    const reason = error instanceof Error ? error.message : String(error);

    return new PublishingError(`${action} failed: ${reason}`, { cause: error });
  }

  if (!error.response) {
    return new PublishingError(
      `${action} failed: no answer from the server (is it running?): ${error.message}`,
      { cause: error },
    );
  }

  const details = readDetails(error.response.data);
  const suffix = details.length > 0 ? `: ${details.join('; ')}` : '';

  return new PublishingError(
    `${action} failed (HTTP ${error.response.status})${suffix}`,
    { cause: error },
  );
};
