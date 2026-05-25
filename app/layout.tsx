import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const notoTc = Noto_Sans_TC({
  variable: "--font-noto-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "旅行狐狸",
  description: "建立並管理你的多日旅遊行程與記帳",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${notoTc.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
