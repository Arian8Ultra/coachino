/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { User } from "@/generated/prisma";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/prisma";
import { endOfMonth, startOfMonth } from "date-fns";
export const CreateToken = (user: User) => {
  if (!process.env.SECRET) {
    throw new Error("SECRET environment variable is not defined");
  }
  return jwt.sign({ user }, process.env.SECRET, {
    expiresIn: "7d",
  });
};

export const VerifyToken = (token: string) => {
  if (!process.env.SECRET) {
    throw new Error("SECRET environment variable is not defined");
  }
  return jwt.verify?.(token, process.env.SECRET);
};

// refresh token
export const RefreshToken = (token: string) => {
  const decoded: any = VerifyToken(token);
  return CreateToken(decoded.user);
};

export const GetUserId = (token: string) => {
  const decoded: any = VerifyToken(token);
  return decoded.user.id as string;
};

export const GetUser = (token: string) => {
  const decoded: any = VerifyToken(token);
  return decoded.user as User;
};

export const HashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const GetCurrentUser = async () => {
  const token = (await cookies()).get("token")?.value || "";
  if (!token) {
    return null;
  }
  try {
    const user = GetUser(token);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const IsAuthenticated = async () => {
  const token = (await cookies()).get("token")?.value || "";
  if (!token) {
    return false;
  }
  try {
    const isValid = VerifyToken(token);
    if (isValid) {
      const user = GetUser(token);
      if (user.is_deactivated) {
        return false;
      }
      return user;
    }
    return false;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

export const IsAuthenticatedAdmin = async () => {
  const token = (await cookies()).get("token")?.value || "";
  if (!token) {
    return false;
  }
  try {
    const isValid = VerifyToken(token);
    if (isValid) {
      const user = GetUser(token);
      if (user.is_deactivated) {
        return false;
      }
      if (user.is_admin) {
        return user;
      }
      return false;
    }
    return false;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

export const checkUserMonthlyLimit = async (user: User): Promise<boolean> => {
  const now = new Date();
  const userSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      endDate: {
        gte: now,
      },
    },
    include: {
      subscription: true,
    },
  });
  if (!userSubscription) {
    return true;
  }
  const monthlyLimit = userSubscription.subscription.chatsPerMonth || 0;
  const userMonthChats = await prisma.message.count({
    where: {
      userId: user.id,
      role: "user",
      createdAt: {
        gte: startOfMonth(now),
        lt: endOfMonth(now),
      },
    },
  });
  console.log("userMonthChats", userMonthChats, "monthlyLimit", monthlyLimit);

  return userMonthChats < monthlyLimit;
};

export const checkUserSenarioLimit = async (user: User): Promise<boolean> => {
  const now = new Date();
  const userSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      endDate: {
        gte: now,
      },
    },
    include: {
      subscription: true,
    },
  });
  if (!userSubscription) {
    return true;
  }
  const senarioLimit = userSubscription.subscription.scenariosPerMonth || 0;
  const userMonthSenarios = await prisma.scenario.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfMonth(now),
        lt: endOfMonth(now),
      },
    },
  });
  console.log(
    "userMonthSenarios",
    userMonthSenarios,
    "senarioLimit",
    senarioLimit,
  );

  return userMonthSenarios < senarioLimit;
};

export const generateReferralCode = (userId: string): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }
  referralCode += userId.slice(0, 4);
  return referralCode;
};
