import "server-only";

/** True when Clerk keys are configured. */
export const authConfigured = !!process.env.CLERK_SECRET_KEY;

/**
 * Resolve the current Clerk user id, or null if Clerk isn't configured or the
 * request is unauthenticated. Never throws — callers gate server storage on it.
 */
export async function getUserId(): Promise<string | null> {
  if (!authConfigured) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
