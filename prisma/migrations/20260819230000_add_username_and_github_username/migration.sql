-- AlterTable
ALTER TABLE "User" DROP COLUMN "githubUrl",
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
