import { sendSms } from "@/lib/kavenegar";
import { User_SendOTP } from "@/prisma/functions/User/UserFun";
import { prisma } from "@/prisma/prisma";


export async function POST(request: Request) {
  const { phone } = await request.json();

  if (!phone) {
    return new Response("Phone number is required", { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      phone: phone,
    },
  });
  if (!user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await prisma.newUserOTP.create({
      data: {
        phone: phone,
        otp: otp,
      },
    });
    sendSms(phone, `Your OTP is: ${otp}`);
    return new Response("OTP sent successfully", { status: 200 });
  }

  const session = await prisma.session.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (session) {
    if (session.expires > new Date()) {
      return new Response("User already logged in", { status: 400 });
    }
  }

  const res = await User_SendOTP(phone);
  if (res) {
    return new Response("OTP sent successfully", { status: 200 });
  }
  return new Response("Failed to send OTP", { status: 500 });
}

