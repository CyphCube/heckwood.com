"use client";

import { useEffect } from "react";
import { initialSync } from "@/lib/sync";

/** Reconciles local favorites/history with the server once on load. */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void initialSync();
  }, []);
  return <>{children}</>;
}
