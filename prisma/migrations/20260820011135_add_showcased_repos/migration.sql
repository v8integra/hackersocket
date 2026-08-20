-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showcasedRepos" TEXT[] DEFAULT ARRAY[]::TEXT[];
