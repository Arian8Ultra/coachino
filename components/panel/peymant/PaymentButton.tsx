'use client';
import { Button } from "@/components/ui/button";
import { Transaction } from "@/generated/prisma";
import React from "react";
import { toast } from "sonner";

interface Props {
  subscriptionId: string;
  amount: number;
  userId: string;
}
const PaymentButton = ({ subscriptionId, amount, userId }: Props) => {
  const handlePayment = async () => {
    const res = await fetch("/api/payment/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriptionId,
        amount,
        userId,
      }),
    });

    const data = (await res.json()) as Transaction;
    if (res.ok) {
      toast.success("در حال انتقال به درگاه پرداخت...");
      window.location.href = `https://gateway.zibal.ir/start/${data.transactionId}`;
    } else {
      toast.error(data.status || "خطایی رخ داده است، لطفا مجددا تلاش کنید.");
    }
  };

  return (
    <Button className='w-full' variant={"accent"} onClick={handlePayment}>
      پرداخت و انتخاب این پلن
    </Button>
  );
};

export default PaymentButton;
