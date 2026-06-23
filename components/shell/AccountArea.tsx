"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AccountArea() {
  // No Clerk keys yet → no auth UI; the app runs in local-only mode.
  if (!clerkEnabled) return null;

  return (
    <>
      <SignedOut>
        <SignInButton>
          <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent-soft">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}
