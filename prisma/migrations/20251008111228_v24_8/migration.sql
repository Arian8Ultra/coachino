-- DropForeignKey
ALTER TABLE "public"."Dimension" DROP CONSTRAINT "Dimension_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionKey" DROP CONSTRAINT "QuestionKey_dimensionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionKey" DROP CONSTRAINT "QuestionKey_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAnswer" DROP CONSTRAINT "UserAnswer_questionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Dimension" ADD CONSTRAINT "Dimension_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionKey" ADD CONSTRAINT "QuestionKey_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionKey" ADD CONSTRAINT "QuestionKey_dimensionId_fkey" FOREIGN KEY ("dimensionId") REFERENCES "public"."Dimension"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnswer" ADD CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
