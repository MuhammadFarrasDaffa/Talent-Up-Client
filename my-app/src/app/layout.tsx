import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seekers",
  description: "AI-Powered Job Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthGuard>{children}</AuthGuard>
        <Footer />
        <Toaster richColors position="top-right" /> {/* Pasang disini */}
      </body>
    </html>
  );
}
