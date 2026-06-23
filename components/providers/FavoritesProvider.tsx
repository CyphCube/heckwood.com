"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  loadFavorites,
  toggleFavorite as toggleLocal,
} from "@/lib/local-store";
import { pushFavorite } from "@/lib/sync";

type FavoritesState = {
  favorites: string[];
  isFavorite: (showSlug: string) => boolean;
  toggle: (showSlug: string) => void;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setReady(true);
    const sync = () => setFavorites(loadFavorites());
    window.addEventListener("heckwood:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("heckwood:store", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = (showSlug: string) => {
    const nowFav = toggleLocal(showSlug);
    setFavorites(loadFavorites());
    void pushFavorite(showSlug, nowFav);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        ready,
        isFavorite: (s) => favorites.includes(s),
        toggle,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
