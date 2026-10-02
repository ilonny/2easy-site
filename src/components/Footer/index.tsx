"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/i18n/T";
import { getClientScale } from "@/hooks/useLandingZoom";
import Keychain from "@/assets/images/footer/keychain.webp";
import TelegramIcon from "@/assets/icons/telegram_dark.svg";

const EMAIL = "double2easy@gmail.com";

const legalLinkClassName =
  "whitespace-nowrap transition-colors hover:text-brand-black";

export const Footer = () => {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const [canPin, setCanPin] = useState(false);

  // The page slides up and uncovers the footer pinned to the bottom of the screen.
  // A footer taller than the screen would never show its top, so it is only pinned when it fits.
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const update = () =>
      setCanPin(
        footer.getBoundingClientRect().height * getClientScale(footer) <=
          window.innerHeight,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(footer);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (pathname !== "/") {
    return null;
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      ref={footerRef}
      className={`${canPin ? "sticky bottom-0" : "relative"} z-0 -mt-10 lg:-mt-[60px]`}
    >
      <div
        className="relative overflow-hidden pt-10 lg:pt-[60px]"
        style={{
          background:
            "linear-gradient(180deg, #C9BBFF 0%, #F1EDFF 91.25%) bottom / 100% 722px no-repeat, #C9BBFF",
        }}
      >
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-5 pb-[30px] pt-[260px] lg:px-[65px] lg:pt-[320px]">
          <Image
            src={Keychain}
            alt=""
            aria-hidden
            sizes="(min-width: 1024px) 506px, 346px"
            className="pointer-events-none absolute left-1/2 top-0 h-[294px] w-[346px] -translate-x-1/2 lg:ml-5 lg:h-[430px] lg:w-[506px]"
          />
          <div className="relative flex w-full max-w-[235px] flex-col items-center gap-5 text-center lg:max-w-[309px] lg:gap-[41px]">
            <T
              k="footer.community"
              as="p"
              className="whitespace-pre-line text-base font-bold leading-[1.09] tracking-brand text-brand-black lg:text-[22px] lg:leading-[1.2]"
            />
            <Link
              href="https://t.me/my2easy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-[125px] items-center justify-between gap-[15px] rounded-[14px] bg-brand-violet py-[7px] pl-3 pr-[7px] text-sm font-bold leading-none tracking-brand text-white transition-opacity hover:opacity-90 md:text-xs lg:w-[164px] lg:text-sm"
            >
              <T k="footer.communityButton" />
              <span className="flex size-8 items-center justify-center rounded-lg bg-white">
                <Image src={TelegramIcon} alt="" aria-hidden />
              </span>
            </Link>
          </div>
          <div className="relative flex w-full flex-col items-center gap-2.5 text-[11px] font-bold leading-[1.09] tracking-brand text-brand-grayFont md:grid md:grid-cols-3 md:items-center lg:text-sm lg:leading-normal">
            <div className="order-2 flex flex-col items-center gap-2.5 md:order-none md:items-start md:gap-[5px] lg:flex-row lg:gap-5">
              <Link
                href="/privacy_policy"
                target="_blank"
                className={legalLinkClassName}
              >
                <T k="footer.privacyPolicy" />
              </Link>
              <Link
                href="/public_offer"
                target="_blank"
                className={legalLinkClassName}
              >
                <T k="footer.publicOffer" />
              </Link>
            </div>
            <T
              k="footer.copyright"
              as="p"
              className="order-3 text-center md:order-none"
            />
            <div className="order-1 flex flex-col items-center gap-5 pb-[30px] md:order-none md:flex-row md:justify-end md:gap-2.5 md:pb-0 lg:gap-5">
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm text-brand-violet transition-opacity hover:opacity-80 md:text-[11px] lg:text-sm"
              >
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={scrollToTop}
                className="rounded-lg bg-white p-3 text-sm leading-[1.09] text-brand-black transition-colors hover:bg-brand-gray md:text-xs lg:text-sm lg:leading-normal"
              >
                <T k="footer.toTop" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
