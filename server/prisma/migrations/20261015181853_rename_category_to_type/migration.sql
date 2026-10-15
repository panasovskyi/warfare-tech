-- Rename the enum types (the values stay the same)
ALTER TYPE "ArticleCategory" RENAME TO "ArticleType";
ALTER TYPE "Subcategory" RENAME TO "ArticleSubcategory";

-- Rename the column: the data stays
ALTER TABLE "articles" RENAME COLUMN "category" TO "type";
