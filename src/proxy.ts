import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const PUBLIC_ROUTES = ["/login"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
