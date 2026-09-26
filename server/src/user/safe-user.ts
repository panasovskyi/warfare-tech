import { User } from 'generated/prisma/client';

export type SafeUser<T extends User = User> = Omit<T, 'password'>;

export const toSafeUser = <T extends User>(user: T): SafeUser<T> => {
  const { password, ...safeUser } = user;

  return safeUser;
};
