import type { Metadata } from "next";
import { JetBrains_Mono, Inter, EB_Garamond } from "next/font/google";
import GrainOverlay from "@/components/GrainOverlay";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Interactive Memory Machine",
  description:
    "Spatial Disorientation — Subconscious Memory Analysis Laboratory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} ${ebGaramond.variable}`}
    >
      <body className="antialiased min-h-screen">
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
