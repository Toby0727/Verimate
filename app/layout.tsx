import type { Metadata } from "next";
import { Figtree, Geist_Mono, Newsreader } from "next/font/google";
import { Suspense } from "react";
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
  // Absolute base for the share image (app/opengraph-image.png) and links.
  metadataBase: new URL("https://www.verimateapp.com"),
  title: "Verimate",
  description: "Sublets + roommates for SU & ESF students.",
  openGraph: {
    siteName: "Verimate",
    type: "website",
    title: "Verimate · Find a roommate. Win a $50 gift card.",
    description:
      "Sublets + roommates for SU & ESF students. Join the waitlist in about a minute.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-100">
        {/* The banner reads the path to hide itself on the waitlist. */}
        <Suspense fallback={null}>
          <DemoBanner />
        </Suspense>
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
