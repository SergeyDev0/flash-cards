import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import Header from "@/components/header/Header";
import AppProviders from "@/components/providers/AppProviders";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Памятные карточки",
  description: "Создавайте и просматривайте персонализированные карточки с напоминаниями, размещенными в определенном интервале.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${notoSans.variable} antialiased`}>
        <AppProviders>
          <div className="w-full min-h-screen bg-[#f7f7f9] text-[#111]">
            <div className="mx-auto flex w-full flex-col px-4 pb-12 pt-2 md:px-8 2xl:w-[1440px]">
              <Header />
              <main className="mt-6 flex-1">{children}</main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
