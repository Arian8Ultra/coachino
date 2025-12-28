import {
  generateReferralCode,
  HashPassword,
  IsAuthenticatedAdmin,
} from "@/auth/AuthFunctions";
import { sendSignUpNotification } from "@/lib/kavenegar";
import { prisma } from "@/prisma/prisma";
export async function POST(request: Request) {
  const user = IsAuthenticatedAdmin();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { users, send_sms } = await request.json();

  if (!users || !Array.isArray(users) || users.length === 0) {
    return new Response(JSON.stringify({ error: "No users provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // check users format

  for (const user of users) {
    if (typeof user !== "object" || !user.name || !user.phone) {
      return new Response(JSON.stringify({ error: "Invalid user format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // create groups
  const createdUsers = [];
  const freeSubscription = await prisma.subscription.findFirst({
    where: {
      price: 0,
    },
  });

  const now = new Date();
  for (const user of users) {
    // const GeneratedPassword = Math.random().toString(36).slice(-8);
    const GeneratedPasswordNumbered = Math.random().toString().slice(2, 8);

    const newReferralCode = generateReferralCode(user.phone);

    const existingUser = await prisma.user.findUnique({
      where: { phone: user.phone },
    });
    if (existingUser) {
      continue; // skip existing users
    }
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        phone: user.phone,
        password: HashPassword(GeneratedPasswordNumbered),
        referral_code: newReferralCode,
      },
    });
    if (freeSubscription) {
      await prisma.userSubscription.create({
        data: {
          userId: newUser.id,
          subscriptionId: freeSubscription.id,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        },
      });
    }
    createdUsers.push({ ...newUser, password: GeneratedPasswordNumbered });
  }

  if (send_sms) {
    for (const user of createdUsers) {
      sendSignUpNotification(user.phone, user.name, user.password, user.phone);
    }
  }

  return new Response(JSON.stringify({ users: createdUsers }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
