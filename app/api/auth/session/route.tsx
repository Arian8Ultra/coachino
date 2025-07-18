import { GetUser } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookie = await cookies();
  const token = cookie.get("token");

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = GetUser(String(token));
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // get user session from database
  const session = await prisma.session.findMany({
    where: {
      userId: user.id,
      token: String(token),
    },
    include: {
      user: true,
    },
  });

  if (session.length === 0) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  return Response.json(session[0], { status: 200 });
}
