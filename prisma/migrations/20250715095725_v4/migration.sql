/*
  Warnings:

  - You are about to drop the column `selectedOptions` on the `UserAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `examResultId` on the `UserExamResult` table. All the data in the column will be lost.
  - You are about to drop the `ExamResult` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `score` to the `UserExamResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserExamResult" DROP CONSTRAINT "UserExamResult_examResultId_fkey";

-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "selectedOptions";

-- AlterTable
ALTER TABLE "UserExamResult" DROP COLUMN "examResultId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "score" TEXT NOT NULL;

-- DropTable
DROP TABLE "ExamResult";
