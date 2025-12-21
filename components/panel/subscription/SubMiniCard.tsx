import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import { SubscriptionOptionEnum } from "@/generated/prisma";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { CheckCircle2, XCircle } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import Link from "next/link";

interface Props {
  subscription: Subscription_GetById;
  justShow?: boolean;
}
const SubMiniCard = ({ subscription, justShow }: Props) => {
  return (
    <GlassBall
      className='flex gap-4 p-4 rounded-lg relative basis-1/3 aspect-video'
      key={subscription.id}
    >
      <DynamicIcon
        name={(subscription.iconName as IconName) || "sparkles"}
        className='text-accent-foreground stroke-1  absolute top-1/2 start-1/2 -translate-y-1/2 translate-x-1/2 text-[10rem] opacity-3 w-full h-auto'
      />

      <div className='flex flex-col gap-5'>
        <h3 className='font-bold text-start text-white'>
          {subscription.name}
        </h3>
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
            {subscription.options?.includes(
              feature as SubscriptionOptionEnum,
            ) ? (
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
        {!justShow && (
          <Link
            href={`${
              subscription.isFree ? "/panel" : `/panel/plans/${subscription.id}`
            }`}
            className='mt-auto border-t pt-4 block w-full'
          >
            <Button
              variant={"shallowGlass"}
              className='w-full rounded-full mt-auto relative p-6'
            >
              {subscription.isFree ? "همین الان شروع کن" : " انتخاب این پلن"}
            </Button>
          </Link>
        )}
      </div>
    </GlassBall>
  );
};

export default SubMiniCard;
