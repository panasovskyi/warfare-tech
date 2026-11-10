import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from 'generated/prisma/enums';
import { AuthService } from 'src/auth/auth.service';
import { LoginResponse } from 'src/auth/auth.types';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { LoginThrottlerGuard } from 'src/auth/guards/login-throttle.guard';
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

  // TODO: тротлінг тут зайвий (нешкідливий): до методу доходить лише адмін з токеном, JwtGuard і
  // RolesGuard стоять раніше. Прибрати ThrottlerGuard і @Throttle разом з імпортом ThrottlerGuard
  @UseGuards(JwtGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Roles([UserRole.ADMIN])
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registrationSchema))
    payload: RegistrationPayload,
  ): Promise<SafeUser> {
    const user = await this.authService.register(payload);

    return toSafeUser(user);
  }

  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
