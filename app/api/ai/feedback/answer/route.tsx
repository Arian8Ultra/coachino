import { IsAuthenticated } from "@/auth/AuthFunctions";
import { sendSms } from "@/lib/kavenegar";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  const { feedbackId, answer } = await request.json();
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  if (user.is_admin === false) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }
  const feedback = await prisma.feedback.update({
    where: {
      id: feedbackId,
    },
    data: {
      answer,
    },
  });

  await prisma.notification.create({
    data: {
      userId: feedback.userId,
      title: "بازخورد شما پاسخ داده شد",
      message: `بازخورد شما با شناسه ${feedback.id} توسط مدیر پاسخ داده شد.`,
      link: `/feedback/${feedback.id}`,
    },
  });

  //   send sms to user about feedback answer

  sendSms(
    (
      await prisma.user.findUnique({
        where: { id: feedback.userId },
      })
    )?.phone || "",
    `بازخورد شما با شناسه ${feedback.id} پاسخ داده شد. لطفا وارد حساب کاربری خود شوید و پاسخ را مشاهده کنید.`,
  );

  return new Response(JSON.stringify(feedback), { status: 200 });
}
