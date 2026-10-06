// Shapes of the JSON the API returns — mirror server/src/article/article.types.ts.
// Dates arrive as ISO strings (JSON has no Date), and optional DB columns
// come back as null, not undefined.

// Enums follow the same pattern Prisma generates on the server:
// a const object for runtime values plus a union type with the same name.
export const ArticleCategory = {
  NEWS: 'NEWS',
  LONGREAD: 'LONGREAD',
} as const;

export type ArticleCategory =
  (typeof ArticleCategory)[keyof typeof ArticleCategory];

export const ArticleSubcategory = {
  AIR: 'AIR',
  LAND: 'LAND',
  CYBER: 'CYBER',
  SPACE: 'SPACE',
  NAVAL: 'NAVAL',
  UAV: 'UAV',
} as const;

export type ArticleSubcategory =
  (typeof ArticleSubcategory)[keyof typeof ArticleSubcategory];

export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export type ArticleAuthor = {
  fullName: string;
  login: string;
};

export type Article = {
  id: string;
  authorId: string;
  category: ArticleCategory;
  subcategory: ArticleSubcategory | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isWarInUkraine: boolean;
  mainPicture: string;
  photoCredit: string | null;
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  source: string | null;
  sourceLink: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /articles: list items come without body
export type ArticleListItem = Omit<Article, 'body'> & {
  author: ArticleAuthor;
};

// GET /articles/:slug
export type ArticleDetails = Article & {
  author: ArticleAuthor;
};

// Query of GET /articles. A `type`, not an `interface`: only type aliases
// are assignable to the Record that api.get expects for params.
export type GetArticlesParams = {
  page?: number;
  limit?: number;
  category?: ArticleCategory;
  subcategory?: ArticleSubcategory;
  isWarInUkraine?: boolean;
  isFeatured?: boolean;
};
