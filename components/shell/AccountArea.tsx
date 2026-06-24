"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AccountArea() {
  // No Clerk keys → no auth UI; the app runs in local-only mode.
  if (!clerkEnabled) return null;
  return <AccountMenu />;
}

function AccountMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!isLoaded) return <div className="h-8 w-8 rounded-full bg-line" />;

  if (!isSignedIn) {
    return (
      <SignInButton>
        <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:bg-accent-soft">
          Sign in
        </button>
      </SignInButton>
    );
  }

  // Revoke the session directly via the FAPI, then hard-navigate home.
  // We deliberately avoid clerk.signOut(): it calls setActive(null), which on
  // @clerk/nextjs fires a server-action revalidation that POSTs to "/" and 405s
  // on the next-on-pages edge runtime — leaving the session un-revoked.
  // session.remove() does just the revocation + cookie clear, no server action.
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      if (clerk.session) {
        await clerk.session.remove();
      } else {
        await Promise.race([
          clerk.signOut().catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      }
    } catch {
      /* ignore — the hard redirect still lands on a re-evaluated session */
    }
    window.location.href = "/";
  };

  const initial =
    user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-elevated ring-2 ring-line transition hover:ring-accent"
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-medium uppercase">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-elevated shadow-player">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {user?.fullName || "Account"}
              </div>
              <div className="truncate text-xs text-muted">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
          <div className="border-t border-line" />
          <button
            onClick={() => {
              setOpen(false);
              clerk.openUserProfile();
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-muted transition hover:bg-surface hover:text-white"
          >
            Manage account
          </button>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="block w-full px-4 py-2.5 text-left text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
