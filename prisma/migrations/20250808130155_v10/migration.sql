-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "url" TEXT;
