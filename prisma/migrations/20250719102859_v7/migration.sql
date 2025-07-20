-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "examId" TEXT;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
