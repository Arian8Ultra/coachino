-- AlterTable
ALTER TABLE "public"."RecommendedScenario" ADD COLUMN     "chosenByCoachino" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chosenByUser" BOOLEAN NOT NULL DEFAULT false;
