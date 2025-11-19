import HomeSubCard from "@/components/panel/subscription/HomeSubCard";
import { VerticalLamp } from "@/components/ui/lamp";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { Coins } from "lucide-react";
import * as motion from "motion/react-client";

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
        <VerticalLamp
          color={"#ffac4d"}
          lampThickness='2.5px'
          className='gap-4 z-20 *:h-full! h-14'
        />
        <Coins className='text-amber-500' />
        {/* <GlassBall className='bg-primary h-fit'>
          <Coins className='text-accent-foreground' />
        </GlassBall> */}
        <h3 className='text-2xl font-bold'>پلن‌های اشتراک کوچینو</h3>
      </div>
      <div className='grid md:grid-cols-3 w-11/12 mx-auto gap-10'>
        {plans.map((plan) => (
          <HomeSubCard key={plan.id} subscription={plan} />
        ))}
      </div>
    </motion.div>
  );
};

export default HomePlans;
