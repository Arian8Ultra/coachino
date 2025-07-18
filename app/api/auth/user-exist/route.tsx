import { prisma } from "@/prisma/prisma";

export async function POST(request: Request) {
  // check if the user exists by phone number
  const { phone } = await request.json();
  if (!phone) {
    return new Response("Phone number is required", { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { phone },
  });
  if (!user) {
    return new Response("User does not exist", { status: 404 });
  }
  return new Response(JSON.stringify({ exists: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
