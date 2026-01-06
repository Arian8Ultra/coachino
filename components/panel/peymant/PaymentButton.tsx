/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/generated/prisma";
import { Search } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  subscriptionId: string;
  amount: number;
  userId: string;
}
const PaymentButton = ({ subscriptionId, amount, userId }: Props) => {
  const [discountCode, setDiscountCode] = React.useState<string>("");
  const [calculatedAmount, setCalculatedAmount] =
    React.useState<number>(amount);

  const calculateFinalAmount = async (code: string) => {
    const res = await fetch("/api/payment/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        subscriptionId,
        discountCode: code,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setCalculatedAmount(data.finalAmount);
    } else {
      toast.error(data.error || "خطایی رخ داده است، لطفا مجددا تلاش کنید.");
      setCalculatedAmount(amount);
    }
  };

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      calculateFinalAmount(discountCode);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [discountCode]);

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
    <div className='flex flex-col border rounded-md gap-2 p-4 w-full'>
      <div className='flex gap-2 border bg-input rounded-md'>
        <Input
          placeholder='کد تخفیف دارید؟'
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className='border-none! bg-transparent! '
        />
        <Button
          variant='shallowGlass'
          size={"icon"}
          className=''
          onClick={() => calculateFinalAmount(discountCode)}
          disabled={!discountCode.trim()}
        >
          <Search size={16} />
        </Button>
      </div>
      <Button
        className='w-full h-full flex items-center justify-center'
        variant={"accentShallowGlass"}
        onClick={handlePayment}
      >
        پرداخت{" "}
        {calculatedAmount == amount ? (
          <span className='me-2'>تومان {(amount * 0.1).toLocaleString()}</span>
        ) : (
          <div className='flex flex-col'>
            <span className='line-through text-muted-foreground me-2 text-xs'>
              {(amount * 0.1).toLocaleString()}
              تومان
            </span>
            <span>{(calculatedAmount * 0.1).toLocaleString()} تومان</span>
          </div>
        )}{" "}
      </Button>
    </div>
  );
};

export default PaymentButton;
