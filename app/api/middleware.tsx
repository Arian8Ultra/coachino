import { NextRequest } from "next/server";

// This function can be marked async if using await inside
export function middleware(request: NextRequest) {
  // Middleware logic goes here
  // if the request is for the login page, allow it
  if (request.nextUrl.pathname.includes("login")) {
    return;
  }
  // Otherwise, redirect to the login page if the user is not authenticated with a token in cookies
  const token = request.cookies.get("token");
  if (!token) {
    return Response.redirect(new URL("/login", request.url), 302);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};