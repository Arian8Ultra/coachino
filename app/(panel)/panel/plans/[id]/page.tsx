import { IsAuthenticated } from "@/auth/AuthFunctions";
import PaymentButton from "@/components/panel/peymant/PaymentButton";
import { subscription_features_map } from "@/lib/t";
import { Subscription_GetById } from "@/prisma/functions/Subscription/SubFun";
import { Coins, Sparkle } from "lucide-react";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await IsAuthenticated();
  if (!user) {
    return <div>لطفا وارد شوید تا بتوانید این صفحه را مشاهده کنید.</div>;
  }
  const subscription = await Subscription_GetById(id);
  return (
    <div className='grid md:grid-cols-5 gap-3 flex-1 h-full'>
      <div className='md:col-span-4 bg-glass p-2 rounded-md flex flex-col gap-4'>
        <h1 className='text-2xl font-bold mb-4'>جزئیات پلن اشتراک</h1>
        <p>
          <strong>نام پلن:</strong> {subscription?.name}
        </p>
        <p>
          <strong>توضیحات:</strong> {subscription?.description}
        </p>
        <div className='border rounded-md bg-glass p-2'>
          {subscription.options.length > 0 && (
            <p>
              <span className='font-bold'>ویژگی‌ها:</span>
            </p>
          )}
          {subscription.options.map((feature, index) => (
            <p key={index}>
              <span>
                <Sparkle className='inline-block me-2 mb-1 stroke-0 fill-accent' />
              </span>
              {subscription_features_map(feature)}
            </p>
          ))}
        </div>
        <p>
          <strong>تعداد چت‌ها در ماه:</strong> {subscription?.chatsPerMonth}
        </p>
        <p>
          <strong>تعداد سناریو در ماه:</strong>{" "}
          {subscription?.scenariosPerMonth}
        </p>
        <p>
          <strong>سطح پلن:</strong> {Array(subscription?.level).fill("⭐")}
        </p>
        <p>
          <strong>مدت اعتبار:</strong> {subscription?.duration} ماه
        </p>
        <p className='bg-glass p-5 border rounded-sm text-center text-2xl mt-auto'>
          <strong>قیمت ماهیانه:</strong> {subscription?.price?.toLocaleString()}{" "}
          تومان
        </p>
      </div>
      {/* payment card */}
      <div className='md:col-span-1 bg-glass p-2 rounded-md flex flex-col gap-4 h-fit'>
        <h2 className='text-xl font-bold mb-4'>
          <span>
            <Coins className='inline-block me-2 mb-1 stroke-0 fill-accent' />
          </span>
          پرداخت
        </h2>
        <p>
          <strong>مبلغ قابل پرداخت:</strong>{" "}
          {typeof subscription?.price === "number"
            ? (subscription.price + subscription.price * 0.1).toLocaleString()
            : "رایگان"}{" "}
          تومان
        </p>
        <div className='bg-glass p-2 border rounded-md'>
          <p className='text-sm'>
            <span>توضیحات پرداخت:</span> مبلغ فوق شامل 10٪ مالیات بر ارزش افزوده
            می‌باشد.
          </p>
        </div>
        <PaymentButton
          amount={
            typeof subscription?.price === "number"
              ? subscription.price + subscription.price * 0.1
              : 0
          }
          subscriptionId={subscription.id}
          userId={user.id}
        />
      </div>
    </div>
  );
}
