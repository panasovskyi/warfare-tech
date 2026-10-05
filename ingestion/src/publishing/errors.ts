import axios from 'axios';

export class PublishingError extends Error {}

type ServerErrorBody = {
  message?: unknown;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

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

// The server answers with { message, fieldErrors, formErrors }: show all of it
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
