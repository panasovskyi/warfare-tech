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

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserPayload): Promise<User> {
    const [isEmailTaken, isLoginTaken] = await Promise.all([
      this.findByEmail(payload.email),
      this.findByLogin(payload.login),
    ]);

    if (isEmailTaken) {
      throw ApiError.fieldErrors({ field: 'email', message: 'Email is taken' });
    }

    if (isLoginTaken) {
      throw ApiError.fieldErrors({ field: 'login', message: 'Login is taken' });
    }

    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { ...payload, password: hashedPassword },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    return user;
  }

  async findByEmailOrLogin(identifier: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { login: identifier }],
      },
    });

    return user;
  }

  async findProfileByLogin(login: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { login },
      ...userProfileArgs,
    });

    return user;
  }
}
