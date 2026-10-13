import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';
import { AuthService } from 'src/auth/auth.service';
import { LoginResponse } from 'src/auth/auth.types';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { type LoginPayload, loginSchema } from 'src/auth/schemas/login.schema';
import {
  registrationSchema,
  type RegistrationPayload,
} from 'src/auth/schemas/registration.schema';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { SafeUser, toSafeUser } from 'src/user/safe-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registrationSchema))
    payload: RegistrationPayload,
  ): Promise<SafeUser> {
    const user = await this.authService.register(payload);

    return toSafeUser(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) payload: LoginPayload,
  ): Promise<LoginResponse<SafeUser>> {
    const { accessToken, user } = await this.authService.login(payload);
    const safeUser = toSafeUser(user);

    return { accessToken, user: safeUser };
  }
}
