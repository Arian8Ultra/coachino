-- AlterTable
ALTER TABLE "public"."Scenario" ADD COLUMN     "approximateTime" INTEGER,
ADD COLUMN     "details" TEXT;

-- CreateTable
CREATE TABLE "public"."RecommendedScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "details" TEXT,
    "approximateTime" INTEGER,
    "userId" TEXT NOT NULL,
    "examResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendedScenario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RecommendedScenario" ADD CONSTRAINT "RecommendedScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecommendedScenario" ADD CONSTRAINT "RecommendedScenario_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "public"."UserExamResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
