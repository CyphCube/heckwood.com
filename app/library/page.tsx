import type { Metadata } from "next";
import { getCatalog } from "@/lib/podcasts";
import { LibraryClient } from "@/components/LibraryClient";

export const metadata: Metadata = {
  title: "Library",
  description: "Your followed shows and episodes in progress.",
  robots: { index: false, follow: false },
};

export default function Library() {
  return <LibraryClient catalog={getCatalog()} />;
}
