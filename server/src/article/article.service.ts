import { Injectable } from '@nestjs/common';
import { Article, ArticleStatus } from 'generated/prisma/client';
import { CreateArticlePayload } from 'src/article/schemas/create-article.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { randomBytes } from 'crypto';
import { GetArticlesQuery } from 'src/article/schemas/get-articles.schema';
import {
  articleDetailsArgs,
  articleListItemArgs,
} from 'src/article/article.queries';
import { ArticleDetails, ArticleListItem } from 'src/article/article.types';
import { PaginatedResponse } from 'src/types/pagination';

const generateSlug = (title: string): string => {
  const base = slugify(title, { lower: true, strict: true });
  const suffix = randomBytes(3).toString('hex');

  return `${base}-${suffix}`;
};

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreateArticlePayload,
    authorId: string,
  ): Promise<Article> {
    const slug = generateSlug(payload.title);

    const article = await this.prisma.article.create({
      data: { ...payload, slug, authorId },
    });

    return article;
  }

  async getAll(
    params: GetArticlesQuery,
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const { page, limit, ...query } = params;

    const where = {
      ...query,
      status: ArticleStatus.PUBLISHED,
    };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        ...articleListItemArgs,
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),

      this.prisma.article.count({
        where,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBySlug(slug: string): Promise<ArticleDetails | null> {
    const article = await this.prisma.article.findUnique({
      ...articleDetailsArgs,
      where: { slug, status: ArticleStatus.PUBLISHED },
    });

    return article;
  }
}
