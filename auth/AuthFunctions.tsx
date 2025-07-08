
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { User } from "@/generated/prisma";
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
  return jwt.verify(token, process.env.SECRET);
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
