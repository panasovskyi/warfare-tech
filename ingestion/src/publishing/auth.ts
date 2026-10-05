import axios from 'axios';
import type { PublishingConfig } from '../config/publishing.config';
import { PublishingError, toPublishingError } from './errors';

const TIMEOUT_MS = 15_000;

// The token lives 30 days and there is no refresh, so every run logs in again
export const login = async ({
  apiBaseUrl,
  login: identifier,
  password,
}: PublishingConfig): Promise<string> => {
  try {
    const response = await axios.post<{ accessToken?: string }>(
      `${apiBaseUrl}/auth/login`,
      { identifier, password },
      { timeout: TIMEOUT_MS },
    );

    const token = response.data.accessToken;

    if (!token) {
      throw new PublishingError('Login failed: the server returned no token');
    }

    return token;
  } catch (error) {
    throw error instanceof PublishingError
      ? error
      : toPublishingError(error, 'Login');
  }
};
