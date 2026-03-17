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

export const metadata: Metadata = {
  title: {
    default: "Top Repos Today",
    template: "%s · Top Repos Today",
  },
  description:
    "A clean daily blog of top GitHub repositories with structured, rule-based summaries.",
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
