-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userExamResultId_fkey";

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userExamResultId_fkey" FOREIGN KEY ("userExamResultId") REFERENCES "UserExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
