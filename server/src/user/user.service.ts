import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import { ApiError } from 'src/exceptions/api-error.exception';
import { userProfileArgs } from 'src/user/user.queries';
import { UserProfile } from 'src/user/user.types';
import { User } from 'generated/prisma/client';

type CreateUserPayload = {
  fullName: string;
  login: string;
  email: string;
  password: string;
};

const SALT_ROUNDS = 10;

// скрізь додати типізацію повернення Promise<...>
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserPayload): Promise<User> {
    const isEmailTaken = await this.findByEmail(payload.email);

    if (isEmailTaken) {
      throw ApiError.fieldErrors({ field: 'email', message: 'Email is taken' });
    }

    const isLoginTaken = await this.findByLogin(payload.login);

    if (isLoginTaken) {
      throw ApiError.fieldErrors({ field: 'login', message: 'Login is taken' });
    }

    // два await можна переписати на promise all

    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { ...payload, password: hashedPassword },
    });

    return user;
  }

  // відрізати пароль
  // може кидати null
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  // відрізати пароль
  // може кидати null
  async findByLogin(login: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    return user;
  }

  // відрізати пароль
  // може кидати null
  async findByEmailOrLogin(identifier: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { login: identifier }],
      },
    });

    return user;
  }

  // відрізати пароль
  // може кидати null
  async findProfileByLogin(login: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { login },
      ...userProfileArgs,
    });

    return user;
  }
}
