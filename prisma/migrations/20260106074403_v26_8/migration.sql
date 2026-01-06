-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "userDiscountCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userDiscountCodeId_fkey" FOREIGN KEY ("userDiscountCodeId") REFERENCES "UserDiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
