import { IsAuthenticated } from "@/auth/AuthFunctions";
import { User_SendOTP_ForChangePassword } from "@/prisma/functions/User/UserFun";

export async function GET() {
  const user = await IsAuthenticated();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userPasswordOTP = await User_SendOTP_ForChangePassword(user.phone);

  if (!userPasswordOTP) {
    return new Response("Failed to send OTP", { status: 500 });
  }

  return new Response("OTP sent successfully", { status: 200 });
}
