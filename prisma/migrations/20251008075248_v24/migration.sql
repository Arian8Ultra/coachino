/*
  Warnings:

  - The `options` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `chatsPerMonth` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scenariosPerMonth` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tasksPerMonth` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionOptionEnum" AS ENUM ('VIDEO_SEARCH', 'SOURCE_PROVIDED', 'ADVANCED_ANALYSIS', 'AUTOMATIC_RESCHEDULING');

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "chatsPerMonth" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "scenariosPerMonth" INTEGER NOT NULL,
ADD COLUMN     "tasksPerMonth" INTEGER NOT NULL,
DROP COLUMN "options",
ADD COLUMN     "options" "public"."SubscriptionOptionEnum"[];
