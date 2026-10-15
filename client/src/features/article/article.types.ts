export const ArticleType = {
  NEWS: 'NEWS',
  LONGREAD: 'LONGREAD',
} as const;

export type ArticleType = (typeof ArticleType)[keyof typeof ArticleType];

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
  type: ArticleType;
  subcategory: ArticleSubcategory | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isWarInUkraine: boolean;
  mainPicture: string;
  photoCredit: string | null;
  photoAlt: string | null;
  slug: string;
  title: string;
  description: string;
  body: string;
  readingTime: number;
  tags: string[];
  source: string | null;
  sourceLink: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArticleListItem = Omit<Article, 'body'> & {
  author: ArticleAuthor;
};

export type ArticleDetails = Article & {
  author: ArticleAuthor;
};

export type GetArticlesParams = {
  page?: number;
  limit?: number;
  type?: ArticleType;
  subcategory?: ArticleSubcategory;
  isWarInUkraine?: boolean;
  isFeatured?: boolean;
};
