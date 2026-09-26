import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma/enums';

export const Roles = Reflector.createDecorator<UserRole[]>();
