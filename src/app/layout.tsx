import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AccessLens — Campus Notice Intelligence",
  description: "Tactile zine notice workbench powered by Google Gemma 4 spatial vision models for Hacktoberfest 2026 × MUJ.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${newsreader.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-serif bg-[#fff8f5] text-[#1e1b19] antialiased selection:bg-[#ffb59c] selection:text-[#390c00]">
        {children}
      </body>
    </html>
  );
}
