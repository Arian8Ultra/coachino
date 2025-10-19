/*
  Warnings:

  - You are about to drop the column `dificulty` on the `UserTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserTask" DROP COLUMN "dificulty",
ADD COLUMN     "difficulty" INTEGER;
