-- AlterTable
ALTER TABLE "public"."UserTask" ADD COLUMN     "isDelayed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUpdated" BOOLEAN NOT NULL DEFAULT false;
