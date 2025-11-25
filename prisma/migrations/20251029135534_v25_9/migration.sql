/*
  Warnings:

  - A unique constraint covering the columns `[referral_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "number_of_referrals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referral_code" TEXT,
ADD COLUMN     "referred_by_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");
