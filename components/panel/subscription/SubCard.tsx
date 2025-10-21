import background from "@/assets/blurry-gradient-haikei (2).svg";
import backgroundGold from "@/assets/blurry-gradient-haikei (3).svg";
import backgroundSilver from "@/assets/blurry-gradient-haikei (4).svg";
import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import { SubscriptionOptionEnum } from "@/generated/prisma";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { CheckCircle2, XCircle } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Image from "next/image";
import Link from "next/link";

interface Props {
  subscription: Subscription_GetById;
}
const SubCard = ({ subscription }: Props) => {
  return (
    <div
      className='flex flex-col gap-4 p-4 rounded-lg relative'
      key={subscription.id}
    >
      {/* <GlassBall
        className={`h-fit absolute top-0 start-0 -translate-y-1/2 translate-x-1/2 p-4`}
      >
        <DynamicIcon
          name={subscription.iconName as IconName}
          className='fill-accent-foreground stroke-0 text-4xl'
        />
      </GlassBall> */}

      <Image
        src={
          subscription.level === 1
            ? background
            : subscription.level === 2
            ? backgroundSilver
            : backgroundGold
        }
        fill
        quality={100}
        alt='background'
        className='w-full h-full object-cover rounded-3xl -z-10'
      />

      <GlassBall className='relative w-[3/4] -start-8 p-6 items-center justify-center flex flex-col gap-1 -top-8 rounded-xl'
      >
        <div className='flex gap-3 items-center'>
          {/* <DynamicIcon
            name={subscription.iconName as IconName}
            className='fill-accent-foreground stroke-0 text-4xl'
          /> */}
          <h3 className='text-xl font-bold text-start text-white'>
            {subscription.name}
          </h3>
        </div>
        {!subscription.isFree ? (
          <span className='text-2xl font-bold text-center text-white'>
            {subscription.price?.toLocaleString()} تومان
          </span>
        ) : (
          <span className='text-2xl font-bold text-center text-white'>
            رایگان
          </span>
        )}
      </GlassBall>
      <DynamicIcon
        name={subscription.iconName as IconName}
        className='text-accent-foreground stroke-1  absolute top-1/2 start-1/2 -translate-y-1/2 translate-x-1/2 text-[10rem] opacity-[3%] w-full h-auto'
      />

      <p className='text-white'>{subscription.description}</p>
      <p className='text-white'>
        <span className='font-bold'>تعداد چت‌ها در ماه:</span>{" "}
        {subscription.chatsPerMonth}
      </p>
      <p>
        <span className='font-bold text-white'>ویژگی‌ها:</span>
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
          text-white ${
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

      <Link
        href={`${
          subscription.isFree ? "/panel" : `/panel/plans/${subscription.id}`
        }`}
        className='mt-auto border-t pt-4 block w-full'
      >
        <Button
          variant={"shallowGlass"}
          className='w-full rounded-full mt-auto relative'
        >
          {subscription.isFree ? "همین الان شروع کن" : " انتخاب این پلن"}
        </Button>
      </Link>
    </div>
  );
};

export default SubCard;
