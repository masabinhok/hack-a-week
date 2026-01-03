-- AlterTable
ALTER TABLE "ServiceStep" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onlineFormUrl" TEXT;
