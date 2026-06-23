"use client";

import { PlayerProvider } from "@/components/player/PlayerProvider";
import { FavoritesProvider } from "./FavoritesProvider";
import { AuthProvider } from "./AuthProvider";
import { SyncProvider } from "./SyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <PlayerProvider>
          <SyncProvider>{children}</SyncProvider>
        </PlayerProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
