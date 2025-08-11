-- AlterTable
ALTER TABLE "public"."UserExamResult" ADD COLUMN     "calcAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "examVersion" TEXT,
ADD COLUMN     "mbtiSimple" JSONB,
ADD COLUMN     "perDimension" JSONB,
ADD COLUMN     "resultJson" JSONB,
ADD COLUMN     "totalAnswered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "typeLetters" TEXT;

-- CreateTable
CREATE TABLE "public"."UserExamDimensionScore" (
    "id" TEXT NOT NULL,
    "userExamResultId" TEXT NOT NULL,
    "dimensionId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "raw" DOUBLE PRECISION NOT NULL,
    "maxAbs" DOUBLE PRECISION NOT NULL,
    "pct" INTEGER NOT NULL,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExamDimensionScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserExamDimensionScore_userExamResultId_idx" ON "public"."UserExamDimensionScore"("userExamResultId");

-- CreateIndex
CREATE INDEX "UserExamDimensionScore_code_idx" ON "public"."UserExamDimensionScore"("code");

-- AddForeignKey
ALTER TABLE "public"."UserExamDimensionScore" ADD CONSTRAINT "UserExamDimensionScore_userExamResultId_fkey" FOREIGN KEY ("userExamResultId") REFERENCES "public"."UserExamResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExamDimensionScore" ADD CONSTRAINT "UserExamDimensionScore_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "public"."Dimension"("id") ON DELETE SET NULL ON UPDATE CASCADE;
