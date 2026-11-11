import type { AuthorProfile } from '@/features/author/author.types';
import { api } from '@/lib/api/client';

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
