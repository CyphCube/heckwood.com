import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { MobileNav } from "@/components/shell/MobileNav";
import { PlayerBar } from "@/components/player/PlayerBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://heckwood.com"),
  applicationName: "Heckwood",
  title: {
    default: "Heckwood — Podcast Directory",
    template: "%s — Heckwood",
  },
  description:
    "A curated podcast app. Browse top shows across tech, science, news, business and true crime — play, favorite, and pick up where you left off.",
  openGraph: {
    type: "website",
    siteName: "Heckwood",
    title: "Heckwood — Podcast Directory",
    description:
      "A curated podcast app. Browse top shows across tech, science, news, business and true crime.",
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Heckwood" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heckwood — Podcast Directory",
    description:
      "A curated podcast app. Browse top shows across tech, science, news, business and true crime.",
    images: ["/og.png"],
  },
  manifest: "/manifest.json",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  appleWebApp: {
    capable: true,
    title: "Heckwood",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d0b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-[#edf2ed] antialiased">
        <Providers>
          <div className="flex">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="flex-1 px-4 pb-44 pt-6 sm:px-6 md:pb-28">
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
          <PlayerBar />
        </Providers>
      </body>
    </html>
  );
}
