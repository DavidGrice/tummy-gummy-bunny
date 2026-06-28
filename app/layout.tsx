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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`antialiased ${caveat.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
