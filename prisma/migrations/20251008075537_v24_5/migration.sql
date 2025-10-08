-- CreateEnum
CREATE TYPE "public"."AnswerType" AS ENUM ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TEXT', 'NUMBER');

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "expectedAnswerType" TEXT,
ADD COLUMN     "expectedAnswers" TEXT[];
