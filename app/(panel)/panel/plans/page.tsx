import GlassBall from "@/components/layout/GlassBall";
import SubCard from "@/components/panel/subscription/SubCard";
import { Subscription_GetAll } from "@/prisma/functions/Subscription/SubFun";
import { Coins } from "lucide-react";
import * as motion from "motion/react-client";

export default async function Page() {
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
          <SubCard key={plan.id} subscription={plan} />
        ))}
      </div>
    </motion.div>
  );
}
