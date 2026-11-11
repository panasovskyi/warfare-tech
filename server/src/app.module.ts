import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ArticleModule } from 'src/article/article.module';
import { UserModule } from 'src/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ArticleModule,
    UserModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 5,
        },
      ],
      errorMessage: 'Too many requests. Please try again in a minute.',
    }),
  ],
})
export class AppModule {}
