import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_CONFIG = {
  ADMIN: {
    dashboard: "/admin/dashboard",
    allowedPrefixes: ["/admin"],
  },

  CLIENT: {
    dashboard: "/client/dashboard",
    allowedPrefixes: ["/client"],
  },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

/**
 * Routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/auth",
  "/api/auth",
] as const;

/**
 * Protected route prefixes
 */
const PROTECTED_PREFIXES = [
  "/admin",
  "/client",
] as const;

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    /**
     * Public routes
     */
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    /**
     * Protected routes
     */
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isProtected) {
      return NextResponse.next();
    }

    /**
     * Not logged in
     */
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/signin", req.url)
      );
    }

    const role = token.role as RoleKey | undefined;

    if (!role || !(role in ROLE_CONFIG)) {
      return NextResponse.redirect(
        new URL("/auth/signin", req.url)
      );
    }

    const config = ROLE_CONFIG[role];

    /**
     * Redirect /admin -> /admin/dashboard
     */
    if (pathname === "/admin") {
      return NextResponse.redirect(
        new URL(config.dashboard, req.url)
      );
    }

    /**
     * Redirect client dashboard root if needed
     */
    if (pathname === "/dashboard") {
      return NextResponse.next();
    }

    /**
     * Role authorization
     */
    const allowed = config.allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!allowed) {
      return NextResponse.redirect(
        new URL(config.dashboard, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export const config = {
  matcher: [
    "/((?!api/auth|api/client/upload/video|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
