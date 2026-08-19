import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
