-- AlterTable
ALTER TABLE "public"."UserTask" ADD COLUMN     "dificulty" INTEGER,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;
