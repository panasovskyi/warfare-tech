/*
  Warnings:

  - Added the required column `body` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED';
