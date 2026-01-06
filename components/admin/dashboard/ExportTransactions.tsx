"use client";
import { Button } from "@/components/ui/button";
import {
    Transaction_GetById
} from "@/prisma/functions/Transaction/Transaction";
import { Ellipsis, Sheet } from "lucide-react";
import React from "react";
import { utils, writeFileXLSX } from "xlsx";
const ExportTransactions = () => {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      disabled={loading}
      size={"icon"}
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/admin/transactions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const rows = data.map((transaction: Transaction_GetById) => ({
          ID: transaction?.id,
          Amount: transaction?.amount,
          UserID: transaction?.userId,
          SubscriptionID: transaction?.subscriptionId,
          CreatedAt: transaction?.createdAt,
          Status: transaction?.status,
          ZibalStatus: transaction?.zibalStatus,
          DiscountCode:
            transaction?.userDiscountCode?.discountCode.code || "N/A",
          UserEmail: transaction?.user?.email,
        }));
        const worksheet = utils.json_to_sheet(rows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Transactions");
        writeFileXLSX(workbook, "transactions.xlsx");
        setLoading(false);
      }}
    >
      {loading ? (
        <Ellipsis size={16} className='animate-pulse' />
      ) : (
        <Sheet size={16} />
      )}
    </Button>
  );
};

export default ExportTransactions;
