import Image from "next/image";
import AppStoreBadge from "@/assets/images/footer/store/app-store.svg";
import GooglePlayBadge from "@/assets/images/footer/store/google-play.png";
import ApkBadge from "@/assets/images/footer/store/apk-download.svg";

export const APP_STORE_URL = "https://apps.apple.com/ru/app/2easy/id6807067057";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.twoeasy.mobile";
export const APK_URL = "http://api.2easyeng.com/uploads/1/twoeasy-release.apk";

const storeBadgeClassName =
  "transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40 focus-visible:ring-offset-2";

type TProps = {
  className?: string;
  badgeClassName?: string;
};

export const StoreBadges = ({
  className = "flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 md:justify-start lg:flex-nowrap lg:gap-2.5",
  badgeClassName = "h-[38px] w-auto lg:h-10",
}: TProps) => (
  <div className={className}>
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={storeBadgeClassName}
      aria-label="Download on the App Store"
    >
      <Image
        src={AppStoreBadge}
        alt="Download on the App Store"
        height={40}
        className={badgeClassName}
      />
    </a>
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={storeBadgeClassName}
      aria-label="Get it on Google Play"
    >
      <Image
        src={GooglePlayBadge}
        alt="Get it on Google Play"
        height={40}
        className={badgeClassName}
      />
    </a>
    <a
      href={APK_URL}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={storeBadgeClassName}
      aria-label="Download APK"
    >
      <Image
        src={ApkBadge}
        alt="Download APK"
        height={40}
        className={badgeClassName}
      />
    </a>
  </div>
);
