/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";
import * as crypto from "crypto";
import { endOfMonth, startOfMonth } from "date-fns";
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
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
      const userFromToken = GetUser(token);
      const user = await prisma.user.findUnique({
        where: { id: userFromToken.id },
      });
      if (user && !user.is_deactivated) {
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

export const IsAuthenticatedCached = async () => {
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

export const IsAuthenticatedUpdated = async (): Promise<User | false> => {
  const token = (await cookies()).get("token")?.value || "";
  if (!token) {
    return false;
  }
  try {
    const isValid = VerifyToken(token);
    if (isValid) {
      const userFromToken = GetUser(token);
      const user = await prisma.user.findUnique({
        where: { id: userFromToken.id },
      });
      if (user && !user.is_deactivated) {
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
      deepAnalysis: false,
      createdAt: {
        gte: startOfMonth(now),
        lt: endOfMonth(now),
      },
    },
  });
  const deepAnalysisMonthChats = await prisma.message.count({
    where: {
      userId: user.id,
      role: "user",
      deepAnalysis: true,
      createdAt: {
        gte: startOfMonth(now),
        lt: endOfMonth(now),
      },
    },
  });
  const totalUserMonthChats = userMonthChats + deepAnalysisMonthChats * 2;
  console.log(
    "totalUserMonthChats",
    totalUserMonthChats,
    "monthlyLimit",
    monthlyLimit,
  );

  return totalUserMonthChats < monthlyLimit;
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

export const checkDiscountCodeValidity = async (code: string) => {
  const codeRecord = await prisma.discountCode.findFirst({
    where: {
      code: code,
      isActive: true,
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() },
    },
  });
  const userDiscountCodes = await prisma.userDiscountCode.count({
    where: {
      discountCodeId: codeRecord?.id || "",
      isUsed: true,
    },
  });

  if (codeRecord) {
    if (
      codeRecord.limitUses == null ||
      codeRecord.limitUses > userDiscountCodes
    ) {
      return codeRecord;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
