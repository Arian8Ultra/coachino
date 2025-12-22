import GlassBall from "@/components/layout/GlassBall";
import { Button } from "@/components/ui/button";
import { SubscriptionOptionEnum } from "@/generated/prisma";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  subscription: Subscription_GetById;
  justShow?: boolean;
}
const SubMiniCard = ({ subscription, justShow }: Props) => {
  return (
    <GlassBall
      className={`flex gap-4 p-4 rounded-lg relative basis-1/3 w-full  ${
        subscription.level === 1
          ? "bg-primary/30"
          : subscription.level === 2
          ? "bg-gray-500/30"
          : "bg-amber-500/30"
      }`}
      key={subscription.id}
    >
      <div className='flex flex-col gap-3'>
        <GlassBall>
          <h3 className='font-bold text-center '>{subscription.name}</h3>
        </GlassBall>
        <p className='text-base'>{subscription.description}</p>
        <p className='text-base'>
          <span className='font-bold'>تعداد چت‌ها در ماه:</span>{" "}
          {subscription.chatsPerMonth}
        </p>
        <p className='text-base'>
          <span className='font-bold '>ویژگی‌ها:</span>
        </p>
        <div className='flex flex-col gap-2'>
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
           text-base ${
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
        </div>

        {!justShow && (
          <Link
            href={`${
              subscription.isFree ? "/panel" : `/panel/plans/${subscription.id}`
            }`}
            className='mt-auto border-t pt-4 block w-full'
          >
            <Button
              variant={"outlineHalo"}
              className='w-full rounded-full mt-auto relative p-5 text-base'
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
