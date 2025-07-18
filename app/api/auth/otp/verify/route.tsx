import { HashPassword } from "@/auth/AuthFunctions";
import { User_Create } from "@/prisma/functions/User/UserFun";
import { prisma } from "@/prisma/prisma";


export async function POST(request: Request) {
  const { phone, otp, name, password } = await request.json();
  if (!phone || !otp) {
    return new Response("Phone number and OTP are required", { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { phone },
  });
  if (!user) {
    const newUserOtp = await prisma.newUserOTP.findUnique({
      where: { phone },
    });
    if (!newUserOtp || newUserOtp.otp !== HashPassword(otp)) {
      return new Response("Invalid OTP", { status: 400 });
    }
    // Create a new user if the OTP is valid
    const newUser = await User_Create({
      name,
      password: HashPassword(password),
      phone,
    });
    if (!newUser) {
      return new Response("User creation failed", { status: 500 });
    }
    // Delete the OTP after successful user creation
    await prisma.newUserOTP.delete({
      where: { phone },
    });
    return new Response(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // If user exists, verify the OTP
  if (user.otp !== HashPassword(otp)) {
    return new Response("Invalid OTP", { status: 400 });
  }
  // If OTP is valid, return success response
  return new Response(
    JSON.stringify({ message: "OTP verified successfully", user }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
