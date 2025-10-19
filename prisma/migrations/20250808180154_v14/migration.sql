-- AlterTable
ALTER TABLE "public"."Scenario" ADD COLUMN     "examResultId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Scenario" ADD CONSTRAINT "Scenario_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "public"."UserExamResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
