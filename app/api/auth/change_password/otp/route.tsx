import { HashPassword, IsAuthenticatedUpdated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { otp, newPassword, confirmNewPassword } = body;

  const user = await IsAuthenticatedUpdated();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!otp || !newPassword || !confirmNewPassword) {
    return new Response(
      JSON.stringify({ error: "All password fields are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (newPassword !== confirmNewPassword) {
    return new Response(
      JSON.stringify({ error: "New passwords do not match" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  console.log("user.change_password_otp:", user.change_password_otp);
  console.log("Provided OTP (hashed):", HashPassword(otp));
  
  
  const isCurrentPasswordValid = user.change_password_otp == HashPassword(otp);

  if (!isCurrentPasswordValid) {
    return new Response(
      JSON.stringify({ error: "Current password is incorrect" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Update password in the database
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: HashPassword(newPassword) },
    });

    return new Response(
      JSON.stringify({ message: "Password changed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error updating password", details: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
