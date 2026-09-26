import { Module } from '@nestjs/common';
import { ArticleController } from 'src/article/article.controller';
import { ArticleService } from 'src/article/article.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  // exports: [ArticleService],
})
export class ArticleModule {}
