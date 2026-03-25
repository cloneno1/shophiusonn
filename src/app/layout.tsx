import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import MainLayout from "./components/layout/MainLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Shop Hiusonn - Shop Robux Uy Tín",
  description: "Shop bán robux uy tín tự động, nạp thẻ liền tay nhận ngay robux. Dịch vụ Roblox hàng đầu Việt Nam.",
  icons: {
    icon: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
