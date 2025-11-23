import background from "@/assets/blurry-gradient-haikei (2).svg";
import backgroundGold from "@/assets/blurry-gradient-haikei (3).svg";
import backgroundSilver from "@/assets/blurry-gradient-haikei (4).svg";
import { Button } from "@/components/ui/button";
import { VerticalLamp } from "@/components/ui/lamp";
import { SubscriptionOptionEnum } from "@/generated/prisma";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  subscription: Subscription_GetById;
  justShow?: boolean;
}
const HomeSubCard = ({ subscription, justShow }: Props) => {
  return (
    <div
      className='flex flex-col gap-4 p-4 rounded-lg relative basis-1/3 px-8 overflow-hidden'
      key={subscription.id}
    >

      <Image
        src={
          subscription.level === 1
            ? background
            : subscription.level === 2
            ? backgroundSilver
            : backgroundGold
        }
        fill
        alt='background'
        className='w-full h-full object-cover rounded-lg -z-10  mask-t-to-80% mask-t-from-30%'
      />

      <div className='relative w-full p-2 items-center justify-center flex flex-col gap-1 rounded-xl'>
        <div className='flex gap-3 items-center w-full'>
          <VerticalLamp
            color={
              subscription.level === 1
                ? "#BA68C8"
                : subscription.level === 2
                ? "#90A4AE"
                : "#FFA726"
            }
            lampThickness='2.5px'
            className='h-full'
          />
          <h3 className='text-xl font-bold text-end '>{subscription.name}</h3>
        </div>
        {!subscription.isFree ? (
          <span className='text-xl font-bold text-end w-full'>
            {subscription.price?.toLocaleString()} تومان
          </span>
        ) : (
          <span className='text-xl font-bold text-end w-full'>رایگان</span>
        )}
      </div>
      {/* <DynamicIcon
        name={(subscription.iconName as IconName) || "sparkles"}
        className='text-accent-foreground stroke-1  absolute top-1/2 start-1/2 -translate-y-1/2 translate-x-1/2 text-[10rem] opacity-3 w-full h-auto'
      /> */}

      <p className=''>{subscription.description}</p>
      <p className=''>
        <span className='font-bold'>تعداد چت‌ها در ماه:</span>{" "}
        {subscription.chatsPerMonth}
      </p>
      <p>
        <span className='font-bold '>ویژگی‌ها:</span>
      </p>
      {Object.keys(SubscriptionOptionEnum).map((feature, index) => (
        <div className='flex gap-2 items-center' key={index + feature}>
          {subscription.options?.includes(feature as SubscriptionOptionEnum) ? (
            <CheckCircle2 className='size-4' />
          ) : (
            <XCircle className='opacity-50 size-4' />
          )}
          <p
            className={`
           ${
             subscription.options?.includes(feature as SubscriptionOptionEnum)
               ? "opacity-100"
               : "opacity-50 line-through"
           }
        `}
          >
            {subscription_features_map(feature as SubscriptionOptionEnum)}
          </p>
        </div>
      ))}
      {!justShow && (
        <Link
          href={`${
            subscription.isFree ? "/panel" : `/panel/plans/${subscription.id}`
          }`}
          className='mt-auto border-t pt-4 block w-full'
        >
          <Button
            variant={"outline"}
            className={`w-full rounded-full mt-auto relative p-6 `}
          >
            {subscription.isFree ? "همین الان شروع کن" : " انتخاب این پلن"}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default HomeSubCard;
