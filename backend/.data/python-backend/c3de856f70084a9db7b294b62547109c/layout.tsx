import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InnovWayz - Digital Transformation & Cybersecurity Solutions",
  description: "Transform your business with InnovWayz's expert consulting services in cybersecurity, digitalization, rapid application development, and more.",
  keywords: "digital transformation, cybersecurity, rapid application development, PDPL consulting, DevOps, talent acquisition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
