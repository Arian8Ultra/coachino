import { NextRequest } from "next/server";
import { GetUser } from "./AuthFunctions";
import { cookies } from "next/headers";

export function AuthProvider(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cookie = request.cookies.get("token")?.value;
  const token = cookie || (authHeader ? authHeader.split(" ")[1] : null);

  if (token) {
    try {
      const user = GetUser(token);
      return  user ;
    } catch {
      return null;
    }
  }

  return null;
}


export async function Auth() {
  const cookie = await cookies()
  const token = cookie.get("token")?.value;

  if (token) {
    try {
      const user = GetUser(token);
      return user;
    } catch {
      return null;
    }
  }

  return null;
}