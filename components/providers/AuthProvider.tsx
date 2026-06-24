"use client";

import { ClerkProvider } from "@clerk/nextjs";

// NEXT_PUBLIC_* is inlined at build time, so this reliably reflects whether
// Clerk is configured. When it isn't, we skip ClerkProvider entirely and the
// app runs in local-only mode (favorites/history in localStorage).
const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return (
    <ClerkProvider
      appearance={{ variables: { colorPrimary: "#22a14f" } }}
    >
      {children}
    </ClerkProvider>
  );
}
