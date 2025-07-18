import { HashPassword } from "@/auth/AuthFunctions";
import { User } from "@/generated/prisma";
import { prisma } from "@/prisma/prisma";
export async function POST(request: Request) {
  // get username and password from request body
  const body = await request.json();
  const { password, confirmPassword, phone, name } = body;
  // validate username and password
  if (!password || !confirmPassword || !phone || !name) {
    return new Response(
      JSON.stringify({ error: "Phone, password and name are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (password !== confirmPassword) {
    return new Response(JSON.stringify({ error: "Passwords do not match" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // create user
  const user = await prisma.user.create({
    data: {
      phone,
      password: HashPassword(password),
      name,
    },
  });

  return new Response(
    JSON.stringify({ message: "User created successfully", user }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export type SignUpResponse = {
  user: User;
  message: string;
};
