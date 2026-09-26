import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TokenPayload } from 'src/auth/auth.types';
import { ApiError } from 'src/exceptions/api-error.exception';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeaders = req.headers.authorization;

    if (!authHeaders) {
      throw ApiError.unauthorized('Authorization header is missing');
    }

    const [bearer, token] = authHeaders.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Invalid token format');
    }

    try {
      const data = this.jwtService.verify<TokenPayload>(token);
      req.user = data;
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    return true;
  }
}
