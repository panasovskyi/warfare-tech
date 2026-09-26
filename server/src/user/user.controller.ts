import { Controller, Get, Param } from '@nestjs/common';
import { ApiError } from 'src/exceptions/api-error.exception';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  type GetProfileParam,
  getProfileSchema,
} from 'src/user/schemas/get-profile.schema';
import { UserService } from 'src/user/user.service';
import { UserProfile } from 'src/user/user.types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':login')
  async getProfile(
    @Param(new ZodValidationPipe(getProfileSchema))
    { login }: GetProfileParam,
  ): Promise<UserProfile> {
    const user = await this.userService.findProfileByLogin(login);

    if (!user) {
      throw ApiError.notFound('Profile not found');
    }

    return user;
  }
}
