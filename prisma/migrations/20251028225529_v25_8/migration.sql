-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "hasReminder" BOOLEAN NOT NULL DEFAULT false;
