/*
  Warnings:

  - Made the column `dueDate` on table `UserTask` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."UserTask" ALTER COLUMN "dueDate" SET NOT NULL;
