import type {
  Metadata,
  Viewport,
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
import { TalkMeSite } from "@/components/TalkMeSite";
import { CookieConsent } from "@/components/CookieConsent";
import { AppInstallBanner } from "@/components/AppInstallBanner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  GlobalVideoCallShell,
  VideoCallProvider,
} from "@/components/VideoCall";
import { NavigationProgress } from "@/components/NavigationProgress";

export const metadata: Metadata = {
  title: "2EASY Interactive",
  description:
    "Интерактивная платформа с готовыми материалами для создания и проведения языковых уроков",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const manrope = Manrope({ subsets: ["cyrillic-ext", "latin-ext"] });

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
            <I18nProvider>
              <AuthContextProvider>
                <SibscribeContextProvider>
                  <EditorContextProvider>
                    <ErrorBoundary>
                      <NavigationProgress />
                      <VideoCallProvider>
                        <AppInstallBanner />
                        <Header />
                        <BodyContainer>{children}</BodyContainer>
                        <Footer />
                        <CookieConsent />
                        <ToastWrapper />
                        <TalkMeSite />
                        <GlobalVideoCallShell />
                      </VideoCallProvider>
                    </ErrorBoundary>
                  </EditorContextProvider>
                </SibscribeContextProvider>
              </AuthContextProvider>
            </I18nProvider>
          </NextUIProvider>
        </ApiProvider>
        {/* Third-party scripts below are hosted in RU and may stall from abroad,
            so they load after window "load" to keep the tab from spinning. */}
        <Script id="metrica-script" strategy="afterInteractive">
          {`
            window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};
            window.ym.l=1*new Date();
            ym(103955671, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <Script
          id="metrica-tag"
          src="https://mc.yandex.ru/metrika/tag.js?id=103955671"
          strategy="lazyOnload"
        />
        <Script id="talk-me-setup" strategy="afterInteractive">
          {`window.TalkMeSetup = {
            domain: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
              ? "2easyeng.com"
              : undefined,
            disableTimeouts: true
          };`}
        </Script>
        <Script id="talk-me-script" strategy="lazyOnload">
          {`(function(){(function c(d,w,m,i) {
        window.supportAPIMethod = m;
        var s = d.createElement('script');
        s.id = 'supportScript';
        s.async = true;
        var id = 'a4267f4522dacb1b9837b30ca1279301';
        s.src = (!i ? 'https://lcab.talk-me.ru/support/support.js' : 'https://static.site-chat.me/support/support.int.js') + '?h=' + id;
        s.onerror = i ? undefined : function(){c(d,w,m,true)};
        w[m] = w[m] ? w[m] : function(){(w[m].q = w[m].q ? w[m].q : []).push(arguments);};
        (d.head ? d.head : d.body).appendChild(s);
      })(document,window,'TalkMe')})();`}
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
        <Script id="vk-pixel" strategy="lazyOnload">
          {`var _tmr = window._tmr || (window._tmr = []);
_tmr.push({id: "3710431", type: "pageView", start: (new Date()).getTime()});
(function (d, w, id) {
  if (d.getElementById(id)) return;
  var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
  ts.src = "https://top-fwz1.mail.ru/js/code.js";
  var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
  if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
})(document, window, "tmr-code");`}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://top-fwz1.mail.ru/counter?id=3710431;js=na"
              style={{ position: "absolute", left: -9999 }}
              alt="Top.Mail.Ru"
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
