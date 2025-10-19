/*
  Warnings:

  - You are about to drop the column `userPromp` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Exam" DROP COLUMN "userPromp",
ADD COLUMN     "userPrompt" TEXT;
