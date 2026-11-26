import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";

// Fonts are self-hosted (app/fonts, SIL OFL 1.1) so builds never depend on fonts.googleapis.com.
// Both files are variable fonts, latin subset (the same coverage the site had with next/font/google).

// Display face: DM Sans is the open substitute for Aeonik Pro (headings, actions, nav).
const display = localFont({
  src: "./fonts/DMSans-latin-var.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-display-face",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

// Text face: Inter for explanatory copy, captions and utility navigation.
const text = localFont({
  src: "./fonts/Inter-latin-var.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-text-face",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remember US — Digital Memorial",
    template: "%s — Remember US",
  },
  description: "A premium private digital memorial. Access by QR code only.",
  // noindex by default; the landing page overrides this with its own metadata
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable}`}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:rounded-full focus:bg-ink focus:text-white focus:px-5 focus:py-3 focus:type-caption focus:font-medium focus:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-deep"
        >
          Skip to content
        </a>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
