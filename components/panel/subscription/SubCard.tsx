import GlassBall from "@/components/layout/GlassBall";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Image from "next/image";
import React from "react";
import background from "@/assets/blurry-gradient-haikei (2).svg";
import backgroundGold from "@/assets/blurry-gradient-haikei (3).svg";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  subscription: Subscription_GetById;
}
const SubCard = ({ subscription }: Props) => {
  return (
    <div
      className='flex flex-col gap-4 p-4 rounded-lg relative'
      key={subscription.id}
    >
      <GlassBall
        className={`h-fit absolute top-0 start-1/2 -translate-y-1/2 translate-x-1/2 p-4`}
      >
        <DynamicIcon
          name={subscription.iconName as IconName}
          className='fill-accent-foreground stroke-0 text-4xl'
        />
      </GlassBall>

      <Image
        src={subscription.level === 1 ? background : backgroundGold}
        fill
        quality={100}
        alt='background'
        className='w-full h-full object-cover rounded-3xl -z-10'
      />
      <h3 className='text-2xl font-bold text-center mt-5 text-shadow-lg text-white'>
        {subscription.name}
      </h3>
      <p className='text-white'>{subscription.description}</p>
      <p className='text-white'>
        <span className='font-bold'>تعداد چت‌ها در ماه:</span>{" "}
        {subscription.chatsPerMonth}
      </p>
      {subscription.options.length > 0 && (
        <p>
          <span className='font-bold text-white'>ویژگی‌ها:</span>
        </p>
      )}
      {subscription.options.map((feature, index) => (
        <p key={index} className='text-white'>
          {subscription_features_map(feature)}
        </p>
      ))}
      <div className='flex flex-col mt-auto gap-2 p-2 border bg-glass/50 rounded-md'>
        {!subscription.isFree && (
          <span className='text-2xl font-bold text-center text-white'>
            {subscription.price?.toLocaleString()} تومان
          </span>
        )}
        <Link
          href={`${
            subscription.isFree ? "/panel" : `/panel/plans/${subscription.id}`
          }`}
          className=''
        >
          <Button variant={"outline"} className='w-full'>
            {subscription.isFree ? "همین الان شروع کن" : " انتخاب این پلن"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SubCard;
