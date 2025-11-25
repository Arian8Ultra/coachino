import { CreateToken, HashPassword } from "@/auth/AuthFunctions";
import { User } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";
export async function POST(request: Request) {
  // get username and password from request body
  const body = await request.json();
  const { password, confirmPassword, phone, name, otp } = body;
  // validate username and password
  if (!password || !confirmPassword || !phone || !name) {
    return new Response(
      JSON.stringify({ error: "Phone, password and name are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (password !== confirmPassword) {
    return new Response(JSON.stringify({ error: "Passwords do not match" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const existingOTP = await prisma.newUserOTP.findFirst({
    where: {
      phone: phone,
    },
  });
  if (!existingOTP) {
    return new Response(JSON.stringify({ error: "OTP not found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const isOtpValid = HashPassword(otp) === existingOTP.otp;
  if (!isOtpValid) {
    return new Response(JSON.stringify({ error: "Invalid OTP" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await prisma.newUserOTP.deleteMany({
    where: {
      phone: phone,
    },
  });

  // create user
  const user = await prisma.user.create({
    data: {
      phone,
      password: HashPassword(password),
      name,
    },
  });
  const freeSubscription = await prisma.subscription.findFirst({
    where: {
      price: 0,
    },
  });

  const now = new Date();
  if (freeSubscription) {
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        subscriptionId: freeSubscription.id,
        createdAt: now,
        updatedAt: now,
        isActive: true,
      },
    });
  }

  const token = CreateToken(user);
  // create new session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      token: token,
    },
  });
  const cookie = await cookies();

  cookie.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return new Response(
    JSON.stringify({ message: "Login successful", token, user, session }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export type SignUpResponse = {
  user: User;
  message: string;
};
