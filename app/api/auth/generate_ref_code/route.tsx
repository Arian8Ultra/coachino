import { generateReferralCode, IsAuthenticated } from "@/auth/AuthFunctions";

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
  return new Response(JSON.stringify({ referral_code: referalCode }), {
    status: 200,
  });
}
