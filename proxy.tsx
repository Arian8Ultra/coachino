import { NextRequest, NextResponse } from "next/server";

// This function can be marked async if using await inside
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (request.nextUrl.pathname.startsWith("/api/") && !token) {
    if (request.url.includes("auth")) {
      return NextResponse.next();
    }
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
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
  matcher: ["/panel/:path*", "/api/:path*"],
};
