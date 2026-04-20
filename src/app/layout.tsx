import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Inter,
  EB_Garamond,
  Share_Tech_Mono,
  VT323,
} from "next/font/google";
import ChassisFrame from "@/components/ChassisFrame";
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

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tech",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-matrix",
  display: "swap",
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
      className={`${jetbrainsMono.variable} ${inter.variable} ${ebGaramond.variable} ${shareTechMono.variable} ${vt323.variable}`}
    >
      <body className="antialiased min-h-screen">
        <ChassisFrame />
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
