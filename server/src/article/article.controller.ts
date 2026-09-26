import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Article, UserRole } from 'generated/prisma/client';
import { ArticleService } from 'src/article/article.service';
import { ArticleDetails, ArticleListItem } from 'src/article/article.types';
import {
  type CreateArticlePayload,
  createArticleSchema,
} from 'src/article/schemas/create-article.schema';
import {
  getArticleDetailsSchema,
  type GetArticleDetailsParam,
} from 'src/article/schemas/get-article-details.schema';
import {
  type GetArticlesQuery,
  getArticlesSchema,
} from 'src/article/schemas/get-articles.schema';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiError } from 'src/exceptions/api-error.exception';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PaginatedResponse } from 'src/types/pagination';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Post()
  async create(
    @Body(new ZodValidationPipe(createArticleSchema))
    payload: CreateArticlePayload,
    @CurrentUser('id') authorId: string,
  ): Promise<Article> {
    const article = await this.articleService.create(payload, authorId);

    return article;
  }

  @Get()
  async getAll(
    @Query(new ZodValidationPipe(getArticlesSchema))
    params: GetArticlesQuery,
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const articles = await this.articleService.getAll(params);

    return articles;
  }

  @Get(':slug')
  async getBySlug(
    @Param(new ZodValidationPipe(getArticleDetailsSchema))
    { slug }: GetArticleDetailsParam,
  ): Promise<ArticleDetails> {
    const article = await this.articleService.getBySlug(slug);

    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    return article;
  }
}
