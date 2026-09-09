import type { Metadata, Viewport } from "next";
import React from "react";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SessionSync } from "@/components/site/session-sync";
import { MotionProvider } from "@/components/site/motion/motion-provider";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mailhound.xyz"),
  title: {
    default: "Mailhound — Email Verification & Validation",
    template: "%s · Mailhound",
  },
  description:
    "Verify email addresses in real time. Catch invalid, disposable, and risky emails before you send. Fast, accurate, and affordable bulk email verification.",
  keywords: [
    "email verification",
    "email validation",
    "bulk email verification",
    "email checker",
    "disposable email detection",
    "verify email address",
  ],
  openGraph: {
    title: "Mailhound — Email Verification & Validation",
    description:
      "Verify email addresses in real time. Catch invalid, disposable, and risky emails before you send.",
    url: "https://mailhound.xyz",
    siteName: "Mailhound",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mailhound — Email Verification & Validation",
    description:
      "Verify email addresses in real time. Catch invalid, disposable, and risky emails before you send.",
  },
};

// theme-color tracks the paper surface so the browser chrome matches the page
// in both schemes (mirrors the --paper token values in globals.css).
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121413" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        {/* Set the theme class before first paint to avoid a flash. Honors a
            stored choice, otherwise follows the OS preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionSync />
        <MotionProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
