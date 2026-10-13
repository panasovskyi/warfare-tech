import { Injectable } from '@nestjs/common';
import { RegistrationPayload } from 'src/auth/schemas/registration.schema';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcrypt';
import { ApiError } from 'src/exceptions/api-error.exception';
import { User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse, TokenPayload } from 'src/auth/auth.types';
import { LoginPayload } from 'src/auth/schemas/login.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegistrationPayload): Promise<User> {
    const user = await this.userService.create(payload);

    return user;
  }

  async login({
    identifier,
    password,
  }: LoginPayload): Promise<LoginResponse<User>> {
    const user = await this.userService.findByEmailOrLogin(identifier);
    const isPasswordMatch = await bcrypt.compare(
      password,
      user?.password || '',
    );

    if (!isPasswordMatch || !user) {
      throw ApiError.unauthorized('Login and/or password is wrong');
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    return { accessToken, user };
  }
}
