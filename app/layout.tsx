import type { Metadata } from "next";
import { Figtree, Geist_Mono, Newsreader } from "next/font/google";
import { DemoBanner } from "@/components/demo/demo-banner";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Serif for profile prompt answers.
const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verimate",
  description: "Verified roommate finding for SU & ESF students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-100">
        <DemoBanner />
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
