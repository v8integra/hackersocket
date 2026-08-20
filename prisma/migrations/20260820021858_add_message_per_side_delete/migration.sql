-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedByRecipientAt" TIMESTAMP(3),
ADD COLUMN     "deletedBySenderAt" TIMESTAMP(3);
