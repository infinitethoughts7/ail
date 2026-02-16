import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ROLE_ROUTES: Record<string, string> = {
  admin: "/swinfy",
  sponsor: "/uwh",
  trainer: "/trainer",
};

const ROLE_PREFIXES: Record<string, string> = {
  "/swinfy": "admin",
  "/uwh": "sponsor",
  "/trainer": "trainer",
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes — allow through
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // No session → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Check if user is accessing a role-specific route they don't have access to
  for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix) && role !== requiredRole) {
      // Redirect to their correct dashboard
      const correctRoute = ROLE_ROUTES[role] || "/login";
      return NextResponse.redirect(new URL(correctRoute, req.url));
    }
  }

  // Redirect old routes to new role-based routes
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/swinfy/verification", req.url));
  }
  if (pathname === "/dashboard") {
    if (role === "sponsor") {
      return NextResponse.redirect(new URL("/uwh/dashboard", req.url));
    }
    return NextResponse.redirect(
      new URL(ROLE_ROUTES[role] || "/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
