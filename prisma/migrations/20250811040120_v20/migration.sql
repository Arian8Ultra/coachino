/*
  Warnings:

  - A unique constraint covering the columns `[examId,code]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."QuestionType" ADD VALUE 'FiveOption';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "anchorA" TEXT,
ADD COLUMN     "anchorB" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "optionWeights" INTEGER[],
ADD COLUMN     "scaleId" TEXT;

-- CreateTable
CREATE TABLE "public"."Scale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "labels" TEXT[],
    "weights" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dimension" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionKey" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "dimensionId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,
    "perOptionWeights" INTEGER[],
    "keyedOptionIndexes" INTEGER[],

    CONSTRAINT "QuestionKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scale_name_key" ON "public"."Scale"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Dimension_examId_code_key" ON "public"."Dimension"("examId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Question_examId_code_key" ON "public"."Question"("examId", "code");

-- AddForeignKey
ALTER TABLE "public"."Dimension" ADD CONSTRAINT "Dimension_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionKey" ADD CONSTRAINT "QuestionKey_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionKey" ADD CONSTRAINT "QuestionKey_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "public"."Dimension"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "public"."Scale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
