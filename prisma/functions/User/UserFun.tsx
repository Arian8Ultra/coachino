import { GetUser, HashPassword } from "@/auth/AuthFunctions";
import { User } from "@/generated/prisma";
import { sendSms } from "@/lib/kavenegar";
import { prisma } from "@/prisma/prisma";

export async function User_GetById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      Notifications: true,
      Session: true,
      Role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export type User_GetById = Awaited<ReturnType<typeof User_GetById>>;

export async function User_GetByToken(token: string) {
  const tokenUser = GetUser(token);
  if (!tokenUser) {
    throw new Error("Invalid token");
  }
  const user = await prisma.user.findFirst({
    where: {
      id: tokenUser.id,
    },
    include: {
      Notifications: true,
      Session: true,
      Role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export type User_GetByToken = Awaited<ReturnType<typeof User_GetByToken>>;

export async function User_GetAll(
  { skip, take }: { skip?: number; take?: number } = {
    skip: 0,
    take: 10,
  },
) {
  const users = await prisma.user.findMany({
    include: {
      Notifications: true,
      Session: true,
      Role: true,
      UserSubscriptions: true,
      _count: {
        select: { Chats: true, UserSubscriptions: true },
      },
      Messages: true,
      Scenarios: true,
      UserTasks: true,
    },
    skip,
    take,
  });

  if (!users) {
    throw new Error("No users found");
  }
  return users;
}
export type User_GetAll = Awaited<ReturnType<typeof User_GetAll>>;

export async function User_Update(id: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id },
    data: data,
    include: {
      Notifications: true,
      Session: true,
      Role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export type User_Update = Awaited<ReturnType<typeof User_Update>>;

export async function User_Delete(id: string) {
  const user = await prisma.user.delete({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export type User_Delete = Awaited<ReturnType<typeof User_Delete>>;

export async function User_Create(data: {
  name: string;
  password: string;
  phone: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      password: data.password,
      phone: data.phone,
    },
    include: {
      Notifications: true,
      Session: true,
      Role: true,
    },
  });

  if (!user) {
    throw new Error("User creation failed");
  }
  return user;
}
export type User_Create = Awaited<ReturnType<typeof User_Create>>;

export async function User_ChangePassword(id: string, newPassword: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { password: newPassword },
    include: {
      Notifications: true,
      Session: true,
      Role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
export type User_ChangePassword = Awaited<
  ReturnType<typeof User_ChangePassword>
>;

export async function User_SendOTP(phone: string) {
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  await prisma.user.update({
    where: { phone },
    data: {
      otp: HashPassword(otp),
    }, // Store the OTP in the user record
  });

  sendSms(phone, `Your OTP is: ${otp}`);
  return { message: "OTP sent successfully" };
}

export type User_SendOTP = Awaited<ReturnType<typeof User_SendOTP>>;

export async function User_Logout(token: string) {
  const user = GetUser(token);
  if (!user) {
    throw new Error("Invalid token");
  }

  const session = await prisma.session.findFirst({
    where: { userId: user.id },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await prisma.session.delete({
    where: { id: session.id },
  });

  return { message: "User logged out successfully" };
}
