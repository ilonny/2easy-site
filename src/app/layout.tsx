import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components";
import { AuthContextProvider } from "@/auth";
import { NextUIProvider } from "@nextui-org/react";
import { ApiProvider } from "@/api";
import { Manrope } from "next/font/google";
import { SibscribeContextProvider } from "@/subscribe/context";
import { ToastWrapper } from "./ToastWrapper";
import { BodyContainer } from "./BodyContainer";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "2EASY Interactive",
  description:
    "Сайт для преподавателей английского: готовые уроки и разговорные игры.",
};

export const viewport: Viewport = {
  width: "1200",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
              <SibscribeContextProvider>
                <Header />
                <BodyContainer>{children}</BodyContainer>
                <Footer />
                <ToastWrapper />
              </SibscribeContextProvider>
            </AuthContextProvider>
          </NextUIProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
