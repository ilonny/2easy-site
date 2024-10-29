import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components";
import { AuthContextProvider } from "@/auth";
import { NextUIProvider } from "@nextui-org/react";
import { ApiProvider } from "@/api";
import { Manrope } from "next/font/google";

export const metadata: Metadata = {
  title: "2EASY Interactive",
  description: "",
};

const manrope = Manrope({ subsets: ["cyrillic"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <ApiProvider>
          <NextUIProvider>
            <AuthContextProvider>
              <Header />
              {children}
            </AuthContextProvider>
          </NextUIProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
