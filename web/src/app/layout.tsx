import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://toprepostoday.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Top Repos Today",
    template: "%s · Top Repos Today",
  },
  description:
    "A clean daily blog of top GitHub repositories with structured, rule-based summaries.",
  openGraph: {
    title: "Top Repos Today",
    description:
      "Daily picks of top GitHub repositories with structured, rule-based summaries.",
    url: "/",
    siteName: "Top Repos Today",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Repos Today",
    description:
      "Daily top GitHub repositories with no-repeat picks and structured summaries.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-dvh bg-app text-ink">
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-5xl px-6 pb-10 pt-6 text-sm text-ink-muted">
            <div className="border-t border-line pt-6">
              Built for daily GitHub repository discovery.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
