import type { AuthorProfile } from '@/features/author/author.types';
import { api } from '@/lib/api/client';

// Як у списків статей: нова стаття з'являється в профілі не пізніше ніж за 5 хвилин
const PROFILE_REVALIDATE_SECONDS = 300;

export const authorApi = {
  async getProfile(login: string): Promise<AuthorProfile> {
    const res = await api.get<AuthorProfile>(
      `/users/${encodeURIComponent(login)}`,
      {
        next: {
          revalidate: PROFILE_REVALIDATE_SECONDS,
        },
      },
    );

    return res;
  },
};
