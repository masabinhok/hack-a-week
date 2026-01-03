/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_phone_idx";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
