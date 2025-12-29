-- AlterTable
ALTER TABLE "User" ADD COLUMN     "change_password_otp" TEXT,
ADD COLUMN     "change_password_otp_expire" TIMESTAMP(3);
