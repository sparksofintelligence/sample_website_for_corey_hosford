import type { Metadata } from "next";
import { Mulish, Saira_Condensed } from "next/font/google";
import "./globals.css";

// DISPLAY_FONT is the single font constant to swap when the exact brand face is identified.
const DISPLAY_FONT = Saira_Condensed({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-display",
  display: "swap",
});

const BODY_FONT = Mulish({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freedom Performance | Demo Storefront",
  description: "A client-side specialist parts storefront demo for Freedom Performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${DISPLAY_FONT.variable} ${BODY_FONT.variable}`}>
      <body>{children}</body>
    </html>
  );
}
