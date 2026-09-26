import { Prisma } from 'generated/prisma/client';
import { userProfileArgs } from 'src/user/user.queries';

export type UserProfile = Prisma.UserGetPayload<typeof userProfileArgs>;
