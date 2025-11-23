import { CreateToken, HashPassword } from "@/auth/AuthFunctions";
import { Session, User } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // get phone and password from request body
  const body = await request.json();
  const { phone, password } = body;

  // validate phone and password
  if (!phone || !password) {
    return new Response(
      JSON.stringify({ error: "Phone and password are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check if password is correct
  if (user.password !== HashPassword(password)) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const currentUserSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
  });

  // check if the user subscription is expired
  if (
    currentUserSubscription?.endDate &&
    currentUserSubscription.endDate < new Date()
  ) {
    const freeSubscription = await prisma.subscription.findFirst({
      where: {
        price: 0,
      },
    });

    const now = new Date();
    if (freeSubscription) {
      await prisma.userSubscription.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isActive: false,
        },
      });
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
  }

  // create token
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

// export the type for the response
export type LoginResponse = {
  token: string;
  user: User;
  session: Session;
};
