import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "https://cheapram.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "CheapRam – Cheapest RAM Prices & Coupons",
  description:
    "Compare RAM prices across US retailers. Find the best deals on DDR4 and DDR5 memory with coupons.",
  openGraph: {
    title: "CheapRam – Cheapest RAM Prices & Coupons",
    description:
      "Compare RAM prices across US retailers. Find the best deals on DDR4 and DDR5 memory with coupons.",
    url: baseUrl,
    siteName: "CheapRam",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CheapRam – Cheapest RAM Prices & Coupons",
    description:
      "Compare RAM prices across US retailers. Find the best deals on DDR4 and DDR5 memory.",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-semibold text-emerald-400">
              CheapRam
            </Link>
            <nav>
              <Link
                href="/ram"
                className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                All deals
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 bg-transparent">{children}</main>
        <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
            <p>
              We earn from qualifying purchases. Product links are affiliate
              links; we may earn a commission at no extra cost to you.
            </p>
            <p className="mt-2">
              This site may show ads. Prices and availability may change.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
