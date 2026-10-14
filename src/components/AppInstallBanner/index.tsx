"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  APP_STORE_URL,
  APK_URL,
  GOOGLE_PLAY_URL,
} from "@/components/Footer/StoreBadges";
import { MOBILE_APP_PROMO_ENABLED } from "@/constants/mobileAppPromo";

const STORAGE_KEY = "2easy-app-install-banner-dismissed";

type TPlatform = "ios" | "android";

const isImmersivePath = (pathname: string) =>
  pathname.startsWith("/editor/") ||
  pathname.startsWith("/lessons/") ||
  pathname.startsWith("/board/") ||
  pathname.startsWith("/shared/");

const detectPlatform = (): TPlatform | null => {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent || "";
  const isIos =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIos) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
};

const isStandaloneApp = () => {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};

export const AppInstallBanner = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [platform, setPlatform] = useState<TPlatform | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!MOBILE_APP_PROMO_ENABLED) {
      setIsVisible(false);
      return;
    }
    if (isImmersivePath(pathname) || isStandaloneApp()) {
      setIsVisible(false);
      return;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setIsVisible(false);
        return;
      }
    } catch {
      // ignore storage errors
    }
    const detected = detectPlatform();
    setPlatform(detected);
    setIsVisible(Boolean(detected));
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (!isVisible || !bannerRef.current) {
      root.style.setProperty("--app-install-banner-h", "0px");
      return;
    }
    const el = bannerRef.current;
    const update = () => {
      root.style.setProperty("--app-install-banner-h", `${el.offsetHeight}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty("--app-install-banner-h", "0px");
    };
  }, [isVisible, platform]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible || !platform) {
    return null;
  }

  return (
    <>
      <div
        ref={bannerRef}
        className="fixed inset-x-0 top-0 z-[65] border-b border-black/10 bg-[#f7f7f8] text-brand-black"
        role="region"
        aria-label={t("appInstallBanner.ariaLabel")}
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={dismiss}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-brand-grayFont transition-colors hover:bg-black/5 hover:text-brand-black"
            aria-label={t("common.close")}
          >
            <span className="relative block size-3.5" aria-hidden>
              <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>

          <span
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#3F28C6] shadow-sm"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              width={889}
              height={315}
              className="h-auto w-[78%] brightness-0 invert"
              decoding="async"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight tracking-brand">
              {t("appInstallBanner.title")}
            </p>
            <p className="truncate text-[11px] leading-tight text-brand-grayFont sm:text-xs">
              {t("appInstallBanner.subtitle")}
            </p>
          </div>

          {platform === "ios" ? (
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-[#007aff] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              {t("appInstallBanner.open")}
            </a>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-violet px-3 py-1.5 text-[11px] font-bold leading-none text-white transition-opacity hover:opacity-90 sm:text-xs"
              >
                {t("appInstallBanner.googlePlay")}
              </a>
              <a
                href={APK_URL}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="rounded-full bg-brand-black px-3 py-1.5 text-[11px] font-bold leading-none text-white transition-opacity hover:opacity-90 sm:text-xs"
              >
                {t("appInstallBanner.apk")}
              </a>
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden
        className="shrink-0"
        style={{ height: "var(--app-install-banner-h, 0px)" }}
      />
    </>
  );
};
