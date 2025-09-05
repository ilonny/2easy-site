import type {
  Metadata,
  // Viewport
} from "next";
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
import Script from "next/script";
import { EditorContextProvider } from "./editor/context";

export const metadata: Metadata = {
  title: "2EASY Interactive",
  description:
    "Интерактивная платформа с готовыми материалами для создания и проведения языковых уроков",
};

// export const viewport: Viewport = {
//   width: "1200",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
// };

const manrope = Manrope({ subsets: ["cyrillic-ext", "latin-ext"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script src="https://widget.cloudpayments.ru/bundles/cloudpayments.js" />
      <body className={`${manrope.className} antialiased`}>
        <ApiProvider>
          <NextUIProvider>
            <AuthContextProvider>
              <SibscribeContextProvider>
                <EditorContextProvider>
                  <Header />
                  <BodyContainer>{children}</BodyContainer>
                  <Footer />
                  <ToastWrapper />
                </EditorContextProvider>
              </SibscribeContextProvider>
            </AuthContextProvider>
          </NextUIProvider>
        </ApiProvider>
        <Script id="metrica-script">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=103955671', 'ym');
            ym(103955671, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://mc.yandex.ru/watch/103955671"
              style={{ position: "absolute", left: -9999 }}
              alt="metrica"
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
