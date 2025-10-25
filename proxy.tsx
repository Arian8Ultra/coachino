import { NextRequest, NextResponse } from "next/server";

// This function can be marked async if using await inside
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const redirectUrl = new URL(
      "/login?redirect=" + encodeURIComponent(request.url),
      request.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/panel/:path*",
};
