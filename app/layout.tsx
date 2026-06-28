import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets:  ["latin"],
  variable: "--font-caveat",
  display:  "swap",
});

export const metadata: Metadata = {
  title: "Tummy Gummy Bunny",
  description: "A Three.js point-and-click adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${caveat.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
