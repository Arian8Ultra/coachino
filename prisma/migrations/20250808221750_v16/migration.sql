-- AlterTable
ALTER TABLE "public"."RecommendedScenario" ADD COLUMN     "chatId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."RecommendedScenario" ADD CONSTRAINT "RecommendedScenario_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
