import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Enable Clerk only when configured; otherwise pass through so the app works
// without any keys (local-only favorites/history).
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files; run on everything else + API.
    "/((?!_next|.*\\.[^/]+$).*)",
    "/api/(.*)",
  ],
};
