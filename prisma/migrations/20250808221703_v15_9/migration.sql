-- AlterTable
ALTER TABLE "public"."Scenario" ADD COLUMN     "chatId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Scenario" ADD CONSTRAINT "Scenario_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
