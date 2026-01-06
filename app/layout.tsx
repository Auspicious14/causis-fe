import type { Metadata } from "next";
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
  title: "Causis | AI Shop System Analyzer",
  description: "Causis is an advanced AI system that infers how real-world environments function, fail, and improve from simple visual input. Optimize your retail space with intelligent insights.",
  keywords: ["AI shop analysis", "retail optimization", "business intelligence", "visual reasoning", "Causis AI"],
  openGraph: {
    title: "Causis - Inferring the World from Sight",
    description: "AI that understands how your business functions and recommends improvements.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
