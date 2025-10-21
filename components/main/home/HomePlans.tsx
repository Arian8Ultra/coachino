import background from "@/assets/blurry-gradient-haikei (2).svg";
import backgroundGold from "@/assets/blurry-gradient-haikei (3).svg";
import GlassBall from "@/components/layout/GlassBall";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { Coins, HeartHandshake, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";

const HomePlans = async () => {
  const plans = await Subscription_GetAll();

  return (
    <motion.div
      className='flex flex-col gap-10 w-full md:px-20 px-10 mt-5'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className='flex gap-2 items-center'>
        <GlassBall className='bg-primary h-fit'>
          <Coins className='text-accent-foreground' />
        </GlassBall>
        <h3 className='text-2xl font-bold'>پلن‌های اشتراک کوچینو</h3>
      </div>
      <div className='grid md:grid-cols-3 w-fit mx-auto gap-10'>
        {plans.map((plan) => (
          <div
            className='flex flex-col gap-4 p-4 rounded-lg relative'
            key={plan.id}
          >
            <GlassBall className={`h-fit absolute top-0 start-1/2 -translate-y-1/2 translate-x-1/2 p-4`}>
              {plan.level === 1 ? (
                <HeartHandshake className='text-primary size-7' />
              ) : plan.level === 2 ? (
                <Sparkles className='fill-accent stroke-0 size-7' />
              ) : null}
            </GlassBall>

            <Image
              src={plan.level === 1 ? background : backgroundGold}
              fill
              quality={100}
              alt='background'
              className='w-full h-full object-cover rounded-3xl -z-10'
            />
            <h3 className='text-2xl font-bold text-center mt-5 text-shadow-lg text-white'>
              {plan.name}
            </h3>
            <p className='text-white'>{plan.description}</p>
            <p className='text-white'>
              <span className='font-bold'>تعداد چت‌ها در ماه:</span>{" "}
              {plan.chatsPerMonth}
            </p>
            {plan.options.length > 0 && (
              <p>
                <span className='font-bold text-white'>ویژگی‌ها:</span>
              </p>
            )}
            {plan.options.map((feature, index) => (
              <p key={index} className='text-white'>
                {subscription_features_map(feature)}
              </p>
            ))}
            <span className='text-2xl font-bold mt-auto text-center border-t border-white pt-4 text-white'>
              {plan.price?.toLocaleString()} تومان
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HomePlans;
