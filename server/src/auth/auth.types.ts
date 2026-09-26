import { UserRole } from 'generated/prisma/enums';
import { SafeUser } from 'src/user/safe-user';

export type LoginResponse<T extends SafeUser> = {
  accessToken: string;
  user: T;
};

export type TokenPayload = {
  id: string;
  role: UserRole;
};
