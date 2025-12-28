-- DropForeignKey
ALTER TABLE "UserExamDimensionScore" DROP CONSTRAINT "UserExamDimensionScore_userExamResultId_fkey";

-- AddForeignKey
ALTER TABLE "UserExamDimensionScore" ADD CONSTRAINT "UserExamDimensionScore_userExamResultId_fkey" FOREIGN KEY ("userExamResultId") REFERENCES "UserExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
