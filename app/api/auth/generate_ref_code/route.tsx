import { generateReferralCode, IsAuthenticated } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET() {
  const user = await IsAuthenticated();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  if (user.referral_code) {
    return new Response(JSON.stringify({ referral_code: user.referral_code }), {
      status: 200,
    });
  }
  const referalCode = generateReferralCode(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { referral_code: referalCode },
  });
  return new Response(JSON.stringify({ referral_code: referalCode }), {
    status: 200,
  });
}
