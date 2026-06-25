import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 self-start text-sm text-muted transition hover:text-white"
      >
        <span aria-hidden>←</span> Back to Heckwood
      </Link>
      <SignUp />
    </div>
  );
}
